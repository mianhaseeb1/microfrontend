import { createAction, props } from '@ngrx/store';
import {
  IPagesCards,
  PagesData,
  PostPages,
} from '../../models/pages-cards.model';

export const loadPages = createAction(
  '[Page] Load Pages',
  props<{ userId: number }>()
);

export const loadPagesSuccess = createAction(
  '[Page] Load Pages Success',
  props<{ pages: IPagesCards }>()
);

export const loadPagesFailure = createAction(
  '[Page] Load Pages Failure',
  props<{ error: any }>()
);

export const createPage = createAction(
  '[Page] Create Page',
  props<{ page: { title: string; userId: number } }>()
);

export const createPageSuccess = createAction(
  '[Page] Create Page Success',
  props<{ page: PagesData }>()
);

export const createPageFailure = createAction(
  '[Page] Create Page Failure',
  props<{ error: any }>()
);
