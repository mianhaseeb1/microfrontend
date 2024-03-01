import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { BookmarkService } from '../../services/bookmark.service';
import * as BookmarkActions from '../actions/bookmark.actions';

@Injectable()
export class BookmarkEffects {
  loadBookmarksByPageId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarkActions.loadBookmarksByPageId),
      mergeMap((action) =>
        this.bookmarkService.getBookmarksByPageId(action.pageId).pipe(
          map((bookmarks) => BookmarkActions.bookmarksLoaded({ bookmarks })),
          catchError(() => of({ type: '[Bookmark] Load Bookmarks Failed' }))
        )
      )
    )
  );

  loadBookmarks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarkActions.loadBookmarks),
      mergeMap(() =>
        this.bookmarkService.getBookmarks().pipe(
          map((bookmarks) => {
            return BookmarkActions.bookmarksLoaded({ bookmarks });
          }),
          catchError(() => of({ type: '[Bookmark] Load Bookmarks Failed' }))
        )
      )
    )
  );

  updateBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarkActions.updateBookmark),
      mergeMap((action) =>
        this.bookmarkService.updateBookmark(action.bookmark).pipe(
          map(() => {
            return BookmarkActions.loadBookmarks();
          }),
          catchError(() => of({ type: '[Bookmark] Update Bookmark Failed' }))
        )
      )
    )
  );

  refreshBookmarks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarkActions.addBookmark, BookmarkActions.updateBookmark),
      map(() => BookmarkActions.loadBookmarks())
    )
  );

  constructor(
    private actions$: Actions,
    private bookmarkService: BookmarkService
  ) {}
}
