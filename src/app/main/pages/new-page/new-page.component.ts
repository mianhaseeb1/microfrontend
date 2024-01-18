import { Component, OnDestroy, OnInit } from '@angular/core';
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
import * as BookmarkActions from '../../../actions/bookmark.actions';
import * as NotebookActions from '../../../actions/notebook.actions';
import { Store } from '@ngrx/store';
import * as fromBookmark from '../../../selectors/bookmark.selectors';
import * as fromNotebook from '../../../selectors/notebook.selectors';
import { v4 as uuidv4 } from 'uuid';
import { Notebook } from '../../../models/notebook.model';
import { NotebookService } from '../../../services/notebook.service';
import { AddNotesComponent } from '../add-notes/add-notes.component';
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

  constructor(
    private bookmarkService: BookmarkService,
    private editorService: EditorService,
    private store: Store,
    private notebookService: NotebookService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(BookmarkActions.loadBookmarks());
    this.items$ = this.store.select(fromBookmark.selectAllBookmarks);
    this.store.dispatch(NotebookActions.loadNotebooks());
    this.notebooks$ = this.store.select(fromNotebook.selectAllNotebooks);

    this.editorContents = this.editorService.getEditorContents();
    this.bookmarkService.onBookmarkDeleted
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.refreshBookmarks();
      });
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

  addNewBookmark(): void {
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

  addNewNotebook(): void {
    const newNotebook: Notebook = {
      id: '',
      content: '',
    };
    this.store.dispatch(NotebookActions.addNotebook({ notebook: newNotebook }));
  }

  onBookmarkAdded(newBookmarkId: string) {
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
}
