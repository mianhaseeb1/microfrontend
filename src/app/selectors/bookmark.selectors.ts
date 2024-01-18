import { createSelector, createFeatureSelector } from '@ngrx/store';
import { BookmarkState } from '../reducers/bookmark.reducer';

export const selectBookmarksState =
  createFeatureSelector<BookmarkState>('bookmarks');

export const selectAllBookmarks = createSelector(
  selectBookmarksState,
  (state: BookmarkState) => state.bookmarks
);
