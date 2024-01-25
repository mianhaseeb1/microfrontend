import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, delay, switchMap } from 'rxjs/operators';
import * as ChatActions from '../actions/chat.actions';

@Injectable()
export class ChatEffects {
  autoRespond$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.sendMessage),
      switchMap((action) =>
        of(
          ChatActions.receiveMessage({
            sessionId: action.sessionId,
            message: 'This is an auto-generated response.',
          })
        ).pipe(delay(700))
      )
    )
  );

  constructor(private actions$: Actions) {}
}
