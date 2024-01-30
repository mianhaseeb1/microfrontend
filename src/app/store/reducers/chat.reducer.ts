import { createReducer, on } from '@ngrx/store';
import * as ChatActions from '../actions/chat.actions';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  sender: 'user' | 'bot';
  content: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  ended: boolean;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId?: string;
}

export const initialState: ChatState = {
  sessions: [],
};

export const chatReducer = createReducer(
  initialState,
  on(ChatActions.startNewSession, (state, { sessionId }) => ({
    ...state,
    currentSessionId: sessionId,
    sessions: [
      ...state.sessions,
      { id: sessionId, messages: [], ended: false },
    ],
  })),
  on(ChatActions.sendMessage, (state, { sessionId, message }) => {
    const sessions = state.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            messages: [
              ...session.messages,
              { sender: 'user' as 'user', content: message },
            ],
          }
        : session
    );
    return { ...state, sessions };
  }),
  on(ChatActions.receiveMessage, (state, { sessionId, message }) => {
    const sessions = state.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            messages: [
              ...session.messages,
              { sender: 'bot' as 'bot', content: message },
            ],
          }
        : session
    );
    return { ...state, sessions };
  }),
  on(ChatActions.endSession, (state, { sessionId }) => {
    return {
      ...state,
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, ended: true } : session
      ),
      currentSessionId:
        state.currentSessionId === sessionId
          ? undefined
          : state.currentSessionId,
    };
  })
);
