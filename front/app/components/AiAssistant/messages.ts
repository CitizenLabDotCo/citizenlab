import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.aiAssistant.title',
    defaultMessage: 'Build with AI',
  },
  newChat: {
    id: 'app.components.aiAssistant.newChat',
    defaultMessage: 'New chat',
  },
  placeholder: {
    id: 'app.components.aiAssistant.placeholder',
    defaultMessage: 'Ask for a change…',
  },
  send: {
    id: 'app.components.aiAssistant.send',
    defaultMessage: 'Send',
  },
  working: {
    id: 'app.components.aiAssistant.working',
    defaultMessage: 'Working on it…',
  },
  elapsed: {
    id: 'app.components.aiAssistant.elapsed',
    defaultMessage: '{seconds, plural, one {# second} other {# seconds}}',
  },
  errorLlmUnavailable: {
    id: 'app.components.aiAssistant.errorLlmUnavailable',
    defaultMessage:
      'The AI service is not available right now. Please try again in a few minutes.',
  },
  errorLlmRequestRejected: {
    id: 'app.components.aiAssistant.errorLlmRequestRejected',
    defaultMessage:
      'The AI service could not handle this request. Try rephrasing it, or start a new chat.',
  },
  errorContextTooLong: {
    id: 'app.components.aiAssistant.errorContextTooLong',
    defaultMessage:
      'This chat has become too long. Start a new chat to continue.',
  },
  errorContextUnavailable: {
    id: 'app.components.aiAssistant.errorContextUnavailable',
    defaultMessage: 'The assistant is not available here.',
  },
  errorConversationBusy: {
    id: 'app.components.aiAssistant.errorConversationBusy',
    defaultMessage:
      'The assistant is still working, or waiting for your decision on a proposed change.',
  },
  errorTooLong: {
    id: 'app.components.aiAssistant.errorTooLong',
    defaultMessage: 'Your message is too long.',
  },
  errorGeneric: {
    id: 'app.components.aiAssistant.errorGeneric',
    defaultMessage: 'Something went wrong. Please try again.',
  },
});
