import { createReducer, on } from '@ngrx/store';
import * as ChatActions from '../actions/chat.actions';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  sender: 'user' | 'bot';
  content: string;
  id: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  ended: boolean;
  loading?: boolean;
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
            loading: true,
            messages: [
              ...session.messages,
              { id: uuidv4(), sender: 'user' as const, content: message },
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
            loading: false,
            messages: [
              ...session.messages,
              { id: uuidv4(), sender: 'bot' as const, content: message },
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
  }),
  on(
    ChatActions.editMessage,
    (state, { sessionId, userMessageId, botMessageId, newContent, isEdit }) => {
      const sessions = state.sessions.map((session) => {
        if (session.id === sessionId) {
          let newUserMessageIndex = -1;

          const filteredMessages = session.messages.filter((message, index) => {
            if (message.id === userMessageId) {
              newUserMessageIndex = index;
              return false;
            }
            return botMessageId ? message.id !== botMessageId : true;
          });

          const newUserMessage: ChatMessage = {
            id: userMessageId,
            sender: 'user',
            content: newContent,
          };

          if (newUserMessageIndex !== -1) {
            filteredMessages.splice(newUserMessageIndex, 0, newUserMessage);
          } else {
            filteredMessages.push(newUserMessage);
          }

          return {
            ...session,
            messages: filteredMessages,
            ended: isEdit,
          };
        } else {
          return session;
        }
      });

      return { ...state, sessions };
    }
  ),
  on(
    ChatActions.editBotMessage,
    (state, { sessionId, messageId, newContent }) => {
      const sessions = state.sessions.map((session) => {
        if (session.id === sessionId) {
          const messages = session.messages.map((message) => {
            if (message.id === messageId) {
              return { ...message, content: newContent };
            }
            return message;
          });

          return { ...session, messages };
        }
        return session;
      });

      return { ...state, sessions };
    }
  )
);
