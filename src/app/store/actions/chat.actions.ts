import { createAction, props } from '@ngrx/store';

export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ sessionId: string; message: string; isEdit?: boolean }>()
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

export const editMessage = createAction(
  '[Chat] Edit Message',
  props<{
    sessionId: string;
    userMessageId: string;
    botMessageId: string | null;
    newContent: string;
    isEdit: boolean;
  }>()
);

export const editBotMessage = createAction(
  '[Chat] Edit Bot Message',
  props<{ sessionId: string; messageId: string; newContent: string }>()
);
