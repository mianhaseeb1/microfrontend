import { EventEmitter, Injectable } from '@angular/core';
import { Bookmark, BookmarkDTO } from '../models/bookmark.model';
import { Observable, Subject, catchError, map, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private bookmarks: Bookmark[] = [];
  private notebookTitleSource = new Subject<{ id: string; newTitle: string }>();
  notebookTitle$ = this.notebookTitleSource.asObservable();
  onBookmarkDeleted = new EventEmitter<void>();
  private apiUrl: string = 'https://api.linkpreview.net';

  constructor(private http: HttpClient) {}

  updateNotebookTitle(update: { id: string; newTitle: string }) {
    this.notebookTitleSource.next(update);
  }

  getBookmarks(): Observable<Bookmark[]> {
    return of(this.bookmarks);
  }

  addBookmark(bookmark: BookmarkDTO): Observable<BookmarkDTO> {
    return this.http.post<BookmarkDTO>(environment.bookmarksApi, bookmark);
  }

  updateBookmark(bookmarkId: number | undefined, data: BookmarkDTO): Observable<any> {
    return this.http.patch(`${environment.bookmarksApi}/${bookmarkId}`, data);
  }

  getLinkPreview(url: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}?key=${
        environment.linkPreviewApiKey
      }&q=${encodeURIComponent(url)}`
    );
  }

  fetchLinkData(url: string): Observable<any> {
    return this.http.get(url, { responseType: 'text' }).pipe(
      map((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const title = doc.querySelector('title')?.innerText || '';
        const link = url;
        const description =
          doc
            .querySelector('meta[name="description"]')
            ?.getAttribute('content') || '';
        const image =
          doc
            .querySelector('meta[property="og:image"]')
            ?.getAttribute('content') || '';
        return { title, description, image, link };
      }),
      catchError((error) => {
        console.error('Error fetching link preview:', error);
        return of(null);
      })
    );
  }

  // addBookmark(data: { pageId: number }): Observable<Bookmark> {
  //   return this.http.post<Bookmark>(`${environment.bookmarksApi}`, data);
  // }

  // updateBookmark(id: string, changes: Partial<Bookmark>): Observable<Bookmark> {
  //   return this.http.patch<Bookmark>(
  //     `${environment.bookmarksApi}/${id}`,
  //     changes
  //   );
  // }
}
