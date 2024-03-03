import { createAction, props } from '@ngrx/store';
import { Bookmark, BookmarkDTO } from '../../models/bookmark.model';

export const deleteBookmark = createAction(
  '[Bookmark] Delete Bookmark',
  props<{ id: string }>()
);

export const loadBookmarks = createAction('[Bookmark] Load Bookmarks');

export const bookmarksLoaded = createAction(
  '[Bookmark] Bookmarks Loaded',
  props<{ bookmarks: Bookmark[] }>()
);

export const addEmptyBookmark = createAction('[Bookmark] Add Empty Bookmark');

export const updateBookmarksOrder = createAction(
  '[Bookmark] Update Bookmarks Order',
  props<{ bookmarks: Bookmark[] }>()
);

export const addBookmark = createAction(
  '[Bookmark] Add Bookmark',
  props<{ bookmark: BookmarkDTO }>()
);

export const bookmarkAdded = createAction(
  '[Bookmark] Bookmark Added',
  props<{ bookmark: BookmarkDTO }>()
);

export const addBookmarkFailed = createAction(
  '[Bookmark] Add Bookmark Failed',
  props<{ error: any }>()
);

export const updateBookmark = createAction(
  '[Bookmark] Update Bookmark',
  props<{ bookmarkId: number | undefined; data: BookmarkDTO }>()
);

export const updateBookmarkSuccess = createAction(
  '[Bookmark] Update Bookmark Success',
  props<{ bookmark: Bookmark }>()
);

export const updateBookmarkFailure = createAction(
  '[Bookmark] Update Bookmark Failure',
  props<{ error: any }>()
);

export const removeEmptyBookmarks = createAction('[Bookmark] Remove Empty Bookmarks');
