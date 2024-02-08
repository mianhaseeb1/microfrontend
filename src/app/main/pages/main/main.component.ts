import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Bookmark } from '../../../models/bookmark.model';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { BookmarkInputComponent } from '../../components/bookmark-input/bookmark-input.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { BookmarkService } from '../../../services/bookmark.service';
import { RouterModule } from '@angular/router';
import { EditorService } from '../../../services/ckeditor.service';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import * as BookmarkActions from '../../../store/actions/bookmark.actions';
import * as NotebookActions from '../../../store/actions/notes.actions';
import { Store } from '@ngrx/store';
import * as fromBookmark from '../../../store/selectors/bookmark.selectors';
import * as fromNotebook from '../../../store/selectors/notes.selectors';
import { v4 as uuidv4 } from 'uuid';
import { Notebook } from '../../../models/notebook.model';
import { NotesComponent } from '../../components/notes/notes.component';
import * as fromChatReducer from '../../../store/reducers/chat.reducer';
import * as ChatActions from '../../../store/actions/chat.actions';
import * as ChatSelectors from '../../../store/selectors/chat.selectors';
import { ChatMessage, ChatSession } from '../../../store/reducers/chat.reducer';
import { DomSanitizer } from '@angular/platform-browser';
import { PagesData } from '../../../models/pages-cards.model';
import { SharedService } from '../../../services/shared.service';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    SharedModule,
    CommonModule,
    BookmarkInputComponent,
    NavBarComponent,
    RouterModule,
    CKEditorModule,
    NotesComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild('autosize') autosize!: ElementRef;
  items: Bookmark[] = [];
  items$!: Observable<Bookmark[]>;
  editorContents: string[] = [];
  EditorType = InlineEditor;
  private unsubscribe$ = new Subject<void>();
  addingNewBookmark: boolean = false;
  notebooks: Notebook[] = [];
  notebooks$!: Observable<Notebook[]>;
  showInput: boolean = false;
  @ViewChild('mainContainer') private mainContainer!: ElementRef;
  chatSessions: ChatSession[] = [];
  currentSessionId: string = '';
  chatSessions$!: Observable<ChatSession[]>;
  currentSessionMessages$!: Observable<fromChatReducer.ChatMessage[]>;
  showScrollToTopButton: boolean = false;
  editingMessage: ChatMessage | null = null;
  originalContent: string = '';
  editingContent: string = '';
  item$: Observable<PagesData | null> = this.sharedService.currentData;
  showButtons: boolean = true;
  lastScrollTop: number = 0;
  editingContentBot: string = '';

  constructor(
    private bookmarkService: BookmarkService,
    private editorService: EditorService,
    public store: Store,
    private sharedService: SharedService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.scrollMainContainerToBottom();
    this.store.dispatch(BookmarkActions.loadBookmarks());
    this.items$ = this.store.select(fromBookmark.selectAllBookmarks);
    this.store.dispatch(NotebookActions.loadNotes());
    this.notebooks$ = this.store.select(fromNotebook.selectAllNotebooks);
    this.chatSessions$ = this.store.select(ChatSelectors.selectChatSessions);
    this.chatSessions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((sessions) => {
        this.chatSessions = sessions;
      });

    this.currentSessionMessages$ = this.store.select(
      ChatSelectors.selectMessagesFromSession(this.currentSessionId)
    );

    this.editorContents = this.editorService.getEditorContents();
    this.bookmarkService.onBookmarkDeleted
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.refreshBookmarks();
      });

    this.items$.subscribe((items) => {
      this.items = items || [];
    });

    this.notebooks$.subscribe((notebooks) => {
      this.notebooks = notebooks || [];
    });

    this.chatSessions$.subscribe((sessions) => {
      this.chatSessions = sessions || [];
    });
  }

  scrollMainContainerToBottom(): void {
    setTimeout(() => {
      const scrollContainer = this.mainContainer.nativeElement;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }, 100);
  }

  drop(event: CdkDragDrop<any[]>) {
    if (!event.previousContainer.data || !event.container.data) {
      console.error('One of the containers has null data');
      return;
    }

    if (event.previousContainer === event.container) {
      const updatedItems = [...event.container.data];
      moveItemInArray(updatedItems, event.previousIndex, event.currentIndex);
    } else {
      const previousItems = [...event.previousContainer.data];
      const currentItems = [...event.container.data];
      transferArrayItem(
        previousItems,
        currentItems,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  refreshBookmarks() {
    this.store.dispatch(BookmarkActions.loadBookmarks());
  }

  toggleChat() {
    this.showInput = !this.showInput;
    this.scrollToBottom();
    if (this.showInput) {
      this.startNewChatSession();
      this.store
        .select(ChatSelectors.selectCurrentSessionId)
        .pipe(take(1))
        .subscribe((sessionId) => {
          if (sessionId !== undefined) {
            this.currentSessionId = sessionId;
          }
        });
      setTimeout(() => {
        document
          .querySelector('.chat-input mat-form-field')!
          .classList.add('active');
        document.querySelector('.btns')!.classList.add('hidden');
      }, 10);
    } else {
      document
        .querySelector('.chat-input mat-form-field')!
        .classList.remove('active');
      document.querySelector('.btns')!.classList.remove('hidden');
    }
  }

  startNewChatSession() {
    this.scrollMainContainerToBottom();
    const newSessionId = uuidv4();
    this.store.dispatch(
      ChatActions.startNewSession({ sessionId: newSessionId })
    );
    this.currentSessionId = newSessionId;
  }

  addNewBookmark(): void {
    this.scrollMainContainerToBottom();
    this.addingNewBookmark = true;
    const newBookmark: Bookmark = {
      id: this.generateUniqueId(),
      title: '',
      comment: '',
      links: [''],
      editMode: true,
    };
    this.store.dispatch(BookmarkActions.addBookmark({ bookmark: newBookmark }));
    this.onBookmarkAdded(newBookmark.id);
  }

  onSendMessage(content: string) {
    if (content.trim() !== '') {
      if (
        !this.currentSessionId ||
        this.isSessionEnded(this.currentSessionId)
      ) {
        const newSessionId = uuidv4();
        this.store.dispatch(
          ChatActions.startNewSession({ sessionId: newSessionId })
        );
        this.currentSessionId = newSessionId;
      }

      this.store.dispatch(
        ChatActions.sendMessage({
          sessionId: this.currentSessionId,
          message: content,
        })
      );
    }
  }

  isSessionEnded(sessionId: string): boolean {
    let isEnded = false;
    this.store
      .select(ChatSelectors.selectChatSessionById(sessionId))
      .pipe(take(1))
      .subscribe((session) => {
        isEnded = session ? session.ended : true;
      });
    return isEnded;
  }

  addNewNotebook(): void {
    this.scrollMainContainerToBottom();
    const newNotebook: Notebook = {
      id: '',
      content: '',
    };
    this.store.dispatch(NotebookActions.addNotes({ note: newNotebook }));
  }

  onBookmarkAdded(newBookmarkId: string) {
    this.scrollMainContainerToBottom();
    this.addingNewBookmark = false;
    const newBookmark = this.items.find(
      (bookmark) => bookmark.id === newBookmarkId
    );
    if (newBookmark) {
      newBookmark.editMode = true;
    }
  }

  private generateUniqueId(): string {
    return uuidv4();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  scrollToBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }

  sanitizeHTML(htmlContent: string) {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  isEditable(message: ChatMessage): boolean {
    return this.editingMessage === message;
  }
  onMessageEditEnter(
    message: ChatMessage,
    newContent: string,
    event: any
  ): void {
    event.preventDefault();
    this.finishEditing(message, newContent);
  }

  onMessageEditDone(message: ChatMessage, newContent: string): void {
    this.finishEditing(message, newContent);
  }

  startEditing(sessionId: string, message: ChatMessage): void {
    this.currentSessionId = sessionId;
    this.editingMessage = message;
    this.originalContent = message.content;
    this.editingContent = message.content;
    this.editingContentBot = message.content;
  }

  // finishEditing(message: ChatMessage, newContent: string): void {
  //   if (newContent !== this.originalContent) {
  //     const botMessageId = this.getBotMessageIdForUserMessage(message.id);
  //     this.store.dispatch(
  //       ChatActions.editMessage({
  //         sessionId: this.currentSessionId,
  //         userMessageId: message.id,
  //         botMessageId: botMessageId,
  //         newContent,
  //         isEdit: true,
  //       })
  //     );
  //   }

  //   this.editingMessage = null;
  //   this.originalContent = '';
  //   this.editingContent = '';
  // }

  onContentChange() {
    const textarea: HTMLTextAreaElement = this.autosize.nativeElement;
    textarea.scrollTop = textarea.scrollHeight;
  }

  startBotMessageEditing(sessionId: string, message: ChatMessage): void {
    this.editingMessage = message;
    this.originalContent = message.content;
    this.editingContent = message.content;
    this.editingContentBot = message.content;
  }

  finishEditing(message: ChatMessage, newContent: string): void {
    if (message.sender === 'bot' && newContent !== this.originalContent) {
      this.store.dispatch(
        ChatActions.editBotMessage({
          sessionId: this.currentSessionId,
          messageId: message.id,
          newContent: newContent,
        })
      );
    } else if (
      message.sender === 'user' &&
      newContent !== this.originalContent
    ) {
      const botMessageId = this.getBotMessageIdForUserMessage(message.id);
      this.store.dispatch(
        ChatActions.editMessage({
          sessionId: this.currentSessionId,
          userMessageId: message.id,
          botMessageId: botMessageId,
          newContent: newContent,
          isEdit: true,
        })
      );
    }

    this.editingMessage = null;
    this.originalContent = '';
    this.editingContent = '';
  }

  private getBotMessageIdForUserMessage(userMessageId: string): string | null {
    let foundUserMessage = false;

    for (const session of this.chatSessions) {
      for (const message of session.messages) {
        if (foundUserMessage && message.sender === 'bot') {
          return message.id;
        }

        if (message.id === userMessageId) {
          foundUserMessage = true;
        }
      }
    }

    return null;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    if (currentScrollTop > this.lastScrollTop) {
      this.showButtons = true;
    } else {
      this.showButtons = false;
    }
    this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  }
}
