import { createReducer, on } from '@ngrx/store';
import { Notebook } from '../../models/notebook.model';
import * as NotebookActions from '../actions/notes.actions';
import { v4 as uuidv4 } from 'uuid';

export interface Notestate {
  notes: Notebook[];
  isAddingNewNotes: boolean;
}

export const initalState: Notestate = {
  notes: [],
  isAddingNewNotes: false,
};

export const notesReducer = createReducer(
  initalState,
  on(NotebookActions.addEmptyNotes, (state) => {
    if (state.isAddingNewNotes) {
      return state;
    }
    return {
      ...state,
      notes: [...state.notes, { id: '', content: '' }],
      isAddingNewNotebook: true,
    };
  }),
  on(NotebookActions.addNotes, (state, { note }) => {
    const newNotebook = { ...note, id: note.id || uuidv4() };
    return {
      ...state,
      notes: [...state.notes, newNotebook],
    };
  }),
  on(NotebookActions.updateNotes, (state, { note }) => ({
    ...state,
    notes: state.notes.map((n) => (n.id === note.id ? note : n)),
  })),
  on(NotebookActions.deleteNotes, (state, { id }) => ({
    ...state,
    notes: state.notes.filter((notes) => notes.id !== id),
  })),
  on(NotebookActions.notesLoaded, (state, { notes }) => ({
    ...state,
    notes,
  }))
);
