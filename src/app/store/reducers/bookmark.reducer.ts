import { createReducer, on } from '@ngrx/store';
import { Bookmark } from '../../models/bookmark.model';
import * as BookmarkActions from '../actions/bookmark.actions';

export interface BookmarkState {
  bookmarks: Bookmark[];
  isAddingNewBookmark: boolean;
}

export const initialState: BookmarkState = {
  bookmarks: [],
  isAddingNewBookmark: false,
};

export const bookmarkReducer = createReducer(
  initialState,
  on(BookmarkActions.deleteBookmark, (state, { id }) => ({
    ...state,
    bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
  })),
  on(BookmarkActions.bookmarksLoaded, (state, { bookmarks }) => ({
    ...state,
    bookmarks,
  })),
  on(BookmarkActions.updateBookmark, (state, { bookmark }) => ({
    ...state,
    bookmarks: state.bookmarks.map((b) =>
      b.id === bookmark.id ? bookmark : b
    ),
  })),
  on(BookmarkActions.addEmptyBookmark, (state) => {
    if (state.isAddingNewBookmark) {
      return state;
    }
    return {
      ...state,
      bookmarks: [
        ...state.bookmarks,
        { id: '', title: '', comment: '', links: [] },
      ],
      isAddingNewBookmark: true,
    };
  }),
  on(BookmarkActions.addBookmark, (state, { bookmark }) => {
    if (bookmark.id) {
      return {
        ...state,
        bookmarks: [...state.bookmarks, bookmark],
      };
    }
    return state;
  }),
  on(BookmarkActions.updateBookmarksOrder, (state, { bookmarks }) => ({
    ...state,
    bookmarks: bookmarks,
  }))
);
