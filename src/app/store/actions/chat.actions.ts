import { createAction, props } from '@ngrx/store';

export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ sessionId: string; message: string }>()
);

export const receiveMessage = createAction(
  '[Chat] Receive Message',
  props<{ sessionId: string; message: string }>()
);

export const startNewSession = createAction(
  '[Chat] Start New Session',
  props<{ sessionId: string }>()
);

export const endSession = createAction(
  '[Chat] End Session',
  props<{ sessionId: string }>()
);
