import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Notestate } from '../reducers/notes.reducer';

export const selectNotebooksState = createFeatureSelector<Notestate>('notes');

export const selectAllNotebooks = createSelector(
  selectNotebooksState,
  (state: Notestate) => state.notes
);
