import { createReducer, on } from '@ngrx/store';
import { Bookmark, BookmarkDTO } from '../../models/bookmark.model';
import * as BookmarkActions from '../actions/bookmark.actions';

export interface BookmarkState {
  bookmarks: BookmarkDTO[];
  isAddingNewBookmark: boolean;
}

export const initialState: BookmarkState = {
  bookmarks: [],
  isAddingNewBookmark: false,
};

export const bookmarkReducer = createReducer(
  initialState,
  on(BookmarkActions.addEmptyBookmark, (state) => ({
    ...state,
    bookmarks: [
      ...state.bookmarks,
      { pageId: 0, title: '', comment: '', links: [{ url: '', link: '' }] },
    ],
    isAddingNewBookmark: true,
  })),
  on(BookmarkActions.bookmarkAdded, (state, { bookmark }) => ({
    ...state,
    bookmarks: [...state.bookmarks, bookmark],
    isAddingNewBookmark: false,
  })),
  on(BookmarkActions.addBookmarkFailed, (state, { error }) => ({
    ...state,
    error: error,
    isAddingNewBookmark: false,
  })),
  on(BookmarkActions.updateBookmark, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(BookmarkActions.updateBookmarkSuccess, (state, { bookmark }) => ({
    ...state,
    bookmarks: state.bookmarks.map((b) =>
      b.id === bookmark.id ? { ...b, ...bookmark } : b
    ),
    isLoading: false,
  })),
  on(BookmarkActions.updateBookmarkFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(BookmarkActions.removeEmptyBookmarks, (state) => ({
    ...state,
    bookmarks: state.bookmarks.filter(
      (bookmark) =>
        !(
          bookmark.title.trim() === '' &&
          bookmark.comment.trim() === '' &&
          bookmark.links.every(
            (link) => link.url.trim() === '' && link.link.trim() === ''
          )
        )
    ),
  }))
);
