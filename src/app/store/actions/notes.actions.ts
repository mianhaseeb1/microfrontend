import { createAction, props } from '@ngrx/store';
import { Notebook } from '../../models/notebook.model';

export const addNotes = createAction(
  '[Notes] Add Notes',
  props<{ note: Notebook }>()
);

export const deleteNotes = createAction(
  '[Notes] Delete Notes',
  props<{ id: string }>()
);

export const updateNotes = createAction(
  '[Notes] Update Notes',
  props<{ note: Notebook }>()
);

export const loadNotes = createAction('[Notes] Load Notes');

export const notesLoaded = createAction(
  '[Notes] Notes Updated',
  props<{ notes: Notebook[] }>()
);

export const addEmptyNotes = createAction(
  '[Notes] Add Empty Notes',
  props<{ note: Notebook }>()
);
