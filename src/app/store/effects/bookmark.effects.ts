import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { BookmarkService } from '../../services/bookmark.service';
import * as BookmarkActions from '../actions/bookmark.actions';

@Injectable()
export class BookmarkEffects {
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
        this.bookmarkService
          .updateBookmark(action.bookmarkId, action.data)
          .pipe(
            map((bookmark) =>
              BookmarkActions.updateBookmarkSuccess({ bookmark })
            ),
            catchError((error) =>
              of(BookmarkActions.updateBookmarkFailure({ error }))
            )
          )
      )
    )
  );

  addBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarkActions.addBookmark),
      switchMap((action) =>
        this.bookmarkService.addBookmark(action.bookmark).pipe(
          map((bookmark) => BookmarkActions.bookmarkAdded({ bookmark })),
          catchError((error) =>
            of(BookmarkActions.addBookmarkFailed({ error }))
          )
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

  bookmarkAdded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarkActions.bookmarkAdded),
      map(() => BookmarkActions.removeEmptyBookmarks())
    )
  );

  constructor(
    private actions$: Actions,
    private bookmarkService: BookmarkService
  ) {}
}
