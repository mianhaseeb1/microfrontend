import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Bookmark, BookmarkDTO } from '../../../models/bookmark.model';
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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EditorService } from '../../../services/ckeditor.service';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tool } from '../../../enums/tools.enum';
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
    NotesComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild('autosize') autosize!: ElementRef;
  items: Bookmark[] = [];
  items$!: Observable<BookmarkDTO[]>;
  editorContents: string[] = [];
  private unsubscribe$ = new Subject<void>();
  addingNewBookmark: boolean = false;
  notebooks: Notebook[] = [];
  notebooks$!: Observable<Notebook[]>;
  showInput: boolean = false;
  @ViewChild('chatContainer') private mainContainer!: ElementRef;
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
  private lastDeletedSession: ChatSession | null = null;
  currentTool: Tool | null = null;
  isMain!: boolean;

  constructor(
    private bookmarkService: BookmarkService,
    private editorService: EditorService,
    public store: Store,
    private sharedService: SharedService,
    private sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isMain = true;
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

    this.activatedRoute.queryParams.subscribe((params) => {
      const title = params['title'];
      if (title) {
        this.sharedService.updateTitle(title);
      }
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

  }

  private scrollToBottom(): void {
    this.mainContainer.nativeElement.scrollTop =
      this.mainContainer.nativeElement.scrollHeight;
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

  delete(sessionId: string) {
    const sessionToDelete = this.chatSessions.find(
      (session) => session.id === sessionId
    );
    if (sessionToDelete) {
      this.lastDeletedSession = sessionToDelete;
      this.store.dispatch(ChatActions.deleteChatSession({ sessionId }));
      this.showUndoSnackbar();
    }
  }

  private showUndoSnackbar() {
    const snackBarRef = this._snackBar.open('Chat session deleted', 'UNDO', {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      if (this.lastDeletedSession) {
        this.store.dispatch(
          ChatActions.undoDeleteChatSession({
            session: this.lastDeletedSession,
          })
        );
        this.lastDeletedSession = null;
      }
    });

    snackBarRef.afterDismissed().subscribe(() => {
      this.lastDeletedSession = null;
    });
  }

  toggleChat() {
    if (this.currentTool && this.currentTool !== Tool.CHAT) {
      this.sharedService.triggerSubmit(this.currentTool);
    }
    this.currentTool = Tool.CHAT;

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
      }, 10);
      this.sharedService.triggerSubmit(Tool.CHAT);
    } else {
      document
        .querySelector('.chat-input mat-form-field')!
        .classList.remove('active');
    }
  }

  startNewChatSession() {
    const newSessionId = uuidv4();
    this.store.dispatch(
      ChatActions.startNewSession({ sessionId: newSessionId })
    );
    setTimeout(() => this.scrollToBottom(), 100);
    this.currentSessionId = newSessionId;
  }

  addNewBookmark(): void {
    if (this.currentTool && this.currentTool !== Tool.BOOKMARK) {
      this.sharedService.triggerSubmit(this.currentTool);
    }
    this.currentTool = Tool.BOOKMARK;
    this.showInput = false;
    this.addingNewBookmark = true;
    
    this.store.dispatch(BookmarkActions.addEmptyBookmark());
    this.sharedService.triggerSubmit(Tool.BOOKMARK);
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
    setTimeout(() => this.scrollToBottom(), 100);
  }

  isSessionEnded(sessionId: string): boolean {
    let isEnded = false;
    this.store
      .select(ChatSelectors.selectChatSessionById(sessionId))
      .pipe(take(1))
      .subscribe((session) => {
        isEnded = session ? session.ended : true;
      });
    setTimeout(() => this.scrollToBottom(), 100);
    return isEnded;
  }

  addNewNotebook(): void {
    if (this.currentTool && this.currentTool !== Tool.NOTE) {
      this.sharedService.triggerSubmit(this.currentTool);
    }
    this.currentTool = Tool.NOTE;
    this.showInput = false;
    const newNotebook: Notebook = {
      id: '',
      content: '',
    };
    this.store.dispatch(NotebookActions.addNotes({ note: newNotebook }));

    this.sharedService.triggerSubmit(Tool.NOTE);
  }

  onBookmarkAdded(newBookmarkId: number) {
    this.addingNewBookmark = false;
    const newBookmark = this.items.find(
      (bookmark) => bookmark.id == newBookmarkId
    );
    if (newBookmark) {
      newBookmark.editMode = true;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    setTimeout(() => this.scrollToBottom(), 100);
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
    setTimeout(() => this.scrollToBottom(), 100);
    return null;
  }

  
}
