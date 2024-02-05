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
import { chatReducer, ChatState } from './chat.reducer';
import { draggableReducer, DraggableState } from './draggable.reducers';
import { pageReducer, PageState } from './pages.reducer';

export interface State {
  bookmarks: BookmarkState;
  notes: Notestate;
  auth: AuthState;
  chat: ChatState;
  draggable: DraggableState;
  pages: PageState;
}

export const reducers: ActionReducerMap<State> = {
  bookmarks: bookmarkReducer,
  notes: notesReducer,
  auth: authReducer,
  chat: chatReducer,
  draggable: draggableReducer,
  pages: pageReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
