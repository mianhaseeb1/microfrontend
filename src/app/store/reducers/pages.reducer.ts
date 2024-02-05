import { createReducer, on } from '@ngrx/store';
import * as PageActions from '../actions/pages.actions';
import { IPagesCards } from '../../models/pages-cards.model';

export interface PageState {
  pages: IPagesCards;
  error: any;
}

export const initialState: PageState = {
  pages: {
    status: '',
    message: '',
    data: [],
  },
  error: null,
};

export const pageReducer = createReducer(
  initialState,
  on(PageActions.loadPagesSuccess, (state, action) => ({
    ...state,
    pages: action.pages,
  })),
  on(PageActions.loadPagesFailure, (state, action) => ({
    ...state,
    error: action.error,
  })),
  on(PageActions.createPageSuccess, (state, action) => {
    const newData = [...state.pages.data, action.page];
    return {
      ...state,
      pages: {
        ...state.pages,
        data: newData,
      },
    };
  }),
  on(PageActions.createPageFailure, (state, action) => ({
    ...state,
    error: action.error,
  }))
);
