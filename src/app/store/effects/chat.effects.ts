import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, delay, switchMap, catchError } from 'rxjs/operators';
import * as ChatActions from '../actions/chat.actions';
import { ChatService } from '../../services/chat.service';

@Injectable()
export class ChatEffects {
  autoRespond$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.sendMessage),
      switchMap((action) =>
        this.chatService.getGptResponse(action.message).pipe(
          switchMap((response) => [
            ChatActions.receiveMessage({
              sessionId: action.sessionId,
              message: response.choices[0].message.content,
            }),
            ChatActions.endSession({ sessionId: action.sessionId }),
          ]),
          catchError(() =>
            of(
              ChatActions.receiveMessage({
                sessionId: action.sessionId,
                message: 'Failed to get response from GPT-4.',
              })
            )
          )
        )
      )
    )
  );

  constructor(private actions$: Actions, private chatService: ChatService) {}
}
