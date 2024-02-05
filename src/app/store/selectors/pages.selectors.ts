import { createSelector, createFeatureSelector } from '@ngrx/store';
import { PageState } from '../reducers/pages.reducer';

export const selectPagesState = createFeatureSelector<PageState>('pages');

export const selectAllPages = createSelector(
  selectPagesState,
  (state: PageState) => state.pages
);

export const selectPageError = createSelector(
  selectPagesState,
  (state: PageState) => state.error
);
