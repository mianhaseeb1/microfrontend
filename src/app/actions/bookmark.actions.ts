import { createAction, props } from '@ngrx/store';
import { Bookmark } from '../models/bookmark.model';

export const addBookmark = createAction(
  '[Bookmark] Add Bookmark',
  props<{ bookmark: Bookmark }>()
);

export const deleteBookmark = createAction(
  '[Bookmark] Delete Bookmark',
  props<{ id: string }>()
);

export const loadBookmarks = createAction('[Bookmark] Load Bookmarks');

export const bookmarksLoaded = createAction(
  '[Bookmark] Bookmarks Loaded',
  props<{ bookmarks: Bookmark[] }>()
);

export const updateBookmark = createAction(
  '[Bookmark] Update Bookmark',
  props<{ bookmark: Bookmark }>()
);

export const addEmptyBookmark = createAction('[Bookmark] Add Empty Bookmark');

export const updateBookmarksOrder = createAction(
  '[Bookmark] Update Bookmarks Order',
  props<{ bookmarks: Bookmark[] }>()
);
