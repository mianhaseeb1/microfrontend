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
import { Observable, Subject, map, take, takeUntil } from 'rxjs';
import * as BookmarkActions from '../../../store/actions/bookmark.actions';
import * as NotebookActions from '../../../store/actions/notes.actions';
import { Store } from '@ngrx/store';
import * as fromBookmark from '../../../store/selectors/bookmark.selectors';
import * as fromNotebook from '../../../store/selectors/notes.selectors';
import { v4 as uuidv4 } from 'uuid';
import { Notebook } from '../../../models/notebook.model';
import { NotebookService } from '../../../services/notebook.service';
import { AddNotesComponent } from '../add-notes/add-notes.component';
import * as fromChatReducer from '../../../store/reducers/chat.reducer';
import * as ChatActions from '../../../store/actions/chat.actions';
import * as ChatSelectors from '../../../store/selectors/chat.selectors';
import { ChatSession } from '../../../store/reducers/chat.reducer';
@Component({
  selector: 'app-new-page',
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
    AddNotesComponent,
  ],
  templateUrl: './new-page.component.html',
  styleUrl: './new-page.component.scss',
})
export class NewPageComponent implements OnInit, OnDestroy {
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
  //messages$!: Observable<fromChatReducer.ChatState['messages']>;
  currentSessionId: string = '';
  chatSessions$!: Observable<ChatSession[]>;
  currentSessionMessages$!: Observable<fromChatReducer.ChatMessage[]>;
  showScrollToTopButton: boolean = false;

  constructor(
    private bookmarkService: BookmarkService,
    private editorService: EditorService,
    public store: Store,
    private notebookService: NotebookService
  ) {}

  ngOnInit(): void {
    this.scrollMainContainerToBottom();
    this.store.dispatch(BookmarkActions.loadBookmarks());
    this.items$ = this.store.select(fromBookmark.selectAllBookmarks);
    this.store.dispatch(NotebookActions.loadNotes());
    this.notebooks$ = this.store.select(fromNotebook.selectAllNotebooks);
    //this.messages$ = this.store.select(ChatSelectors.selectMessages);
    this.chatSessions$ = this.store.select(ChatSelectors.selectChatSessions);
    this.chatSessions$ = this.store.select(ChatSelectors.selectChatSessions);

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

  scrollMainContainerToBottom(): void {
    setTimeout(() => {
      const scrollContainer = this.mainContainer.nativeElement;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }, 100);
  }

  drop(event: CdkDragDrop<Bookmark[]>): void {
    this.items$
      .pipe(
        take(1),
        map((items) => {
          const updatedItems = [...items];
          moveItemInArray(
            updatedItems,
            event.previousIndex,
            event.currentIndex
          );
          return updatedItems;
        })
      )
      .subscribe((updatedItems) => {
        this.store.dispatch(
          BookmarkActions.updateBookmarksOrder({ bookmarks: updatedItems })
        );
        this.items = updatedItems;
      });
  }

  refreshBookmarks() {
    this.store.dispatch(BookmarkActions.loadBookmarks());
  }

  toggleChat() {
    this.showInput = !this.showInput;
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

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop > (documentHeight - windowHeight) / 2) {
      this.showScrollToTopButton = true;
    } else {
      this.showScrollToTopButton = false;
    }
  }
}
