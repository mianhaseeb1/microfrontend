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
import { authReducer, AuthState } from './auth.reducer';

export interface State {
  bookmarks: BookmarkState;
  notebooks: NotebookState;
  auth: AuthState;
}

export const reducers: ActionReducerMap<State> = {
  bookmarks: bookmarkReducer,
  notebooks: notebookReducer,
  auth: authReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
