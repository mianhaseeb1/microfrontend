import { isDevMode } from '@angular/core';
import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { bookmarkReducer, BookmarkState } from './bookmark.reducer';
import { notesReducer, Notestate } from './notes.reducer';
import { authReducer, AuthState } from './auth.reducer';

export interface State {
  bookmarks: BookmarkState;
  notes: Notestate;
  auth: AuthState;
}

export const reducers: ActionReducerMap<State> = {
  bookmarks: bookmarkReducer,
  notes: notesReducer,
  auth: authReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
