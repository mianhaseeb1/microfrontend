import { createAction, props } from '@ngrx/store';

export const login = createAction('[Auth] Login');

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);
export const handleAuthCallback = createAction(
  '[Auth] Handle Auth Callback',
  props<{ code: string }>()
);
export const logout = createAction('[Auth] Logout');
export const loginDummy = createAction('[Auth] Login Dummy');

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: any; accessToken: string }>()
);
