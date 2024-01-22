import { createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

export const selectIsAuthenticated = createSelector(
  (state: AuthState) => state,
  (state: AuthState) => state.isAuthenticated
);
