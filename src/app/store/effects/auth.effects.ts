import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, tap } from 'rxjs/operators';
import * as AuthActions from '../actions/auth.actions';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { AuthCallbackResponse } from '../../models/auth.model';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(() =>
        this.authService.login().pipe(
          tap((response: any) => {
            window.location.href = response.data;
          }),
          map(() => AuthActions.loginDummy()),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  handleAuthCallback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.handleAuthCallback),
      mergeMap((action) =>
        this.authService.handleAuthCallback(action.code).pipe(
          map((callbackResponse: AuthCallbackResponse) => {
            const user = callbackResponse.data.userInfo;
            const accessToken = callbackResponse.data.accessToken;
            sessionStorage.setItem('accessToken', accessToken);
            return AuthActions.loginSuccess({ user, accessToken });
          }),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  loginRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          localStorage.setItem('auth', 'authentication successful');
          this.router.navigate(['/home']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('auth');
          this.router.navigateByUrl('/');
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private authService: AuthService
  ) {}
}
