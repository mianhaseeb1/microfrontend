import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ChatState } from '../reducers/chat.reducer';

export const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectChatSessions = createSelector(
  selectChatState,
  (chatState: ChatState) => chatState.sessions
);

export const selectChatSessionById = (sessionId: string) =>
  createSelector(selectChatState, (chatState: ChatState) =>
    chatState.sessions.find((session) => session.id === sessionId)
  );

export const selectMessagesFromSession = (sessionId: string) =>
  createSelector(selectChatSessionById(sessionId), (session) =>
    session ? session.messages : []
  );

export const selectCurrentSessionId = createSelector(
  selectChatState,
  (chatState: ChatState) => chatState.currentSessionId
);
