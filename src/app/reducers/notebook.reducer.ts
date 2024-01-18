import { createReducer, on } from '@ngrx/store';
import { Notebook } from '../models/notebook.model';
import * as NotebookActions from '../actions/notebook.actions';
import { v4 as uuidv4 } from 'uuid';

export interface NotebookState {
  notebooks: Notebook[];
  isAddingNewNotebook: boolean;
}

export const initalState: NotebookState = {
  notebooks: [],
  isAddingNewNotebook: false,
};

export const notebookReducer = createReducer(
  initalState,
  on(NotebookActions.addEmptyNotebook, (state) => {
    if (state.isAddingNewNotebook) {
      return state;
    }
    return {
      ...state,
      notebooks: [...state.notebooks, { id: '', content: '' }],
      isAddingNewNotebook: true,
    };
  }),
  on(NotebookActions.addNotebook, (state, { notebook }) => {
    const newNotebook = { ...notebook, id: notebook.id || uuidv4() };
    return {
      ...state,
      notebooks: [...state.notebooks, newNotebook],
    };
  }),
  on(NotebookActions.updateNotebook, (state, { notebook }) => ({
    ...state,
    notebooks: state.notebooks.map((n) =>
      n.id === notebook.id ? notebook : n
    ),
  })),
  on(NotebookActions.deleteNotebook, (state, { id }) => ({
    ...state,
    notebooks: state.notebooks.filter((notebook) => notebook.id !== id),
  })),
  on(NotebookActions.notebooksLoaded, (state, { notebooks }) => ({
    ...state,
    notebooks,
  }))
);
