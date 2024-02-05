import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, delay, switchMap, catchError } from 'rxjs/operators';
import * as ChatActions from '../actions/chat.actions';
import { ChatService } from '../../services/chat.service';
import { Action } from '@ngrx/store';

@Injectable()
export class ChatEffects {
  autoRespond$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.sendMessage),
      switchMap((action) =>
        this.chatService.getGptResponse(action.message).pipe(
          switchMap((response) => {
            const actionsToDispatch: Action[] = [
              ChatActions.receiveMessage({
                sessionId: action.sessionId,
                message: this.formatMessage(
                  response.choices[0].message.content
                ),
              }),
            ];

            if (!action.isEdit) {
              actionsToDispatch.push(
                ChatActions.endSession({ sessionId: action.sessionId })
              );
            }

            return actionsToDispatch;
          }),
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

  handleEdit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.editMessage),
      switchMap((action) => {
        if (action.isEdit) {
          return this.chatService.getGptResponse(action.newContent).pipe(
            map((response) =>
              ChatActions.receiveMessage({
                sessionId: action.sessionId,
                message: this.formatMessage(
                  response.choices[0].message.content
                ),
              })
            ),
            catchError((error) =>
              of(
                ChatActions.receiveMessage({
                  sessionId: action.sessionId,
                  message: 'Failed to get response for the edited message.',
                })
              )
            )
          );
        } else {
          return of();
        }
      })
    )
  );

  private formatMessage(message: string): string {
    let formattedMessage = message
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/(?:\r\n|\r|\n)/g, '<br>');

    if (formattedMessage.includes('- ')) {
      formattedMessage =
        '<ul>' +
        formattedMessage.replace(/- (.*?)(<br>)/g, '<li>$1</li>') +
        '</ul>';
    }

    return formattedMessage;
  }

  constructor(private actions$: Actions, private chatService: ChatService) {}
}
