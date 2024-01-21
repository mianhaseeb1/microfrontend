import { createAction, props } from '@ngrx/store';
import { Notebook } from '../../models/notebook.model';

export const addNotebook = createAction(
  '[Notebook] Add Notebook',
  props<{ notebook: Notebook }>()
);

export const deleteNotebook = createAction(
  '[Notebook] Delete Notebook',
  props<{ id: string }>()
);

export const updateNotebook = createAction(
  '[Notebook] Update Notebook',
  props<{ notebook: Notebook }>()
);

export const loadNotebooks = createAction('[Notebook] Load Notebooks');

export const notebooksLoaded = createAction(
  '[Notebook] Notebook Updated',
  props<{ notebooks: Notebook[] }>()
);

export const addEmptyNotebook = createAction(
  '[Notebook] Add Empty Notebook',
  props<{ notebook: Notebook }>()
);
