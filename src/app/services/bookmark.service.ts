import { EventEmitter, Injectable } from '@angular/core';
import { Bookmark } from '../models/bookmark.model';
import { Observable, Subject, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private bookmarks: Bookmark[] = [];

  private notebookTitleSource = new Subject<{ id: string; newTitle: string }>();

  notebookTitle$ = this.notebookTitleSource.asObservable();

  onBookmarkDeleted = new EventEmitter<void>();

  updateNotebookTitle(update: { id: string; newTitle: string }) {
    this.notebookTitleSource.next(update);
  }

  getBookmarks(): Observable<Bookmark[]> {
    return of(this.bookmarks);
  }

  addBookmark(bookmark: Bookmark): Observable<Bookmark> {
    if (!bookmark?.id) {
      bookmark.id = uuidv4();
    }
    this.bookmarks.push(bookmark);
    return of(bookmark);
  }

  deleteBookmark(id: string): Observable<any> {
    this.bookmarks = this.bookmarks.filter((bookmark) => bookmark.id !== id);
    this.onBookmarkDeleted.emit();
    return of({ success: true });
  }

  updateBookmark(bookmark: Bookmark): Observable<any> {
    const index = this.bookmarks.findIndex((b) => b.id === bookmark.id);
    if (index !== -1) {
      this.bookmarks[index] = bookmark;
      return of({ success: true, message: 'Bookmark updated successfully.' });
    } else {
      return of({ success: false, message: 'Bookmark not found.' });
    }
  }
}
