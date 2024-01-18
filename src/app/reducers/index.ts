import { isDevMode } from '@angular/core';
import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { bookmarkReducer, BookmarkState } from './bookmark.reducer';
import { notebookReducer, NotebookState } from './notebook.reducer';

export interface State {
  bookmarks: BookmarkState;
  notebooks: NotebookState;
}

export const reducers: ActionReducerMap<State> = {
  bookmarks: bookmarkReducer,
  notebooks: notebookReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
