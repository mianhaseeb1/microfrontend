import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotebookState } from '../reducers/notebook.reducer';

export const selectNotebooksState =
  createFeatureSelector<NotebookState>('notebooks');

export const selectAllNotebooks = createSelector(
  selectNotebooksState,
  (state: NotebookState) => state.notebooks
);
