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
  attachFile: {
    id: 'app.components.aiAssistant.attachFile',
    defaultMessage: 'Attach a file',
  },
  removeFile: {
    id: 'app.components.aiAssistant.removeFile',
    defaultMessage: 'Remove {fileName}',
  },
  dropFiles: {
    id: 'app.components.aiAssistant.dropFiles',
    defaultMessage: 'Drop PDF, Markdown or text files here',
  },
  filesNotice: {
    id: 'app.components.aiAssistant.filesNotice',
    defaultMessage:
      "Attached files are added to this project's files and shared with AI.",
  },
  filesRejected: {
    id: 'app.components.aiAssistant.filesRejected',
    defaultMessage:
      'Only PDF, Markdown (.md) and text (.txt) files of up to {maxSizeMb} MB can be attached, {maxFiles} at most.',
  },
  awaitingApprovalHint: {
    id: 'app.components.aiAssistant.awaitingApprovalHint',
    defaultMessage: 'Approve or reject the proposed change to continue.',
  },
  working: {
    id: 'app.components.aiAssistant.working',
    defaultMessage: 'Working on it…',
  },
  elapsed: {
    id: 'app.components.aiAssistant.elapsed',
    defaultMessage: '{seconds, plural, one {# second} other {# seconds}}',
  },
  proposedChange: {
    id: 'app.components.aiAssistant.proposedChange',
    defaultMessage: 'Proposed change',
  },
  approve: {
    id: 'app.components.aiAssistant.approve',
    defaultMessage: 'Approve',
  },
  reject: {
    id: 'app.components.aiAssistant.reject',
    defaultMessage: 'Reject',
  },
  rejectReasonLabel: {
    id: 'app.components.aiAssistant.rejectReasonLabel',
    defaultMessage: 'What should change? (optional)',
  },
  confirmReject: {
    id: 'app.components.aiAssistant.confirmReject',
    defaultMessage: 'Reject and tell the assistant',
  },
  cancel: {
    id: 'app.components.aiAssistant.cancel',
    defaultMessage: 'Cancel',
  },
  statusAutoExecuted: {
    id: 'app.components.aiAssistant.statusAutoExecuted',
    defaultMessage: 'Read: {tool}',
  },
  statusExecuted: {
    id: 'app.components.aiAssistant.statusExecuted',
    defaultMessage: 'Applied: {tool}',
  },
  statusRejected: {
    id: 'app.components.aiAssistant.statusRejected',
    defaultMessage: 'Rejected: {tool}',
  },
  statusFailed: {
    id: 'app.components.aiAssistant.statusFailed',
    defaultMessage: 'Failed: {tool}',
  },
  statusExpired: {
    id: 'app.components.aiAssistant.statusExpired',
    defaultMessage: 'Expired: {tool}',
  },
  statusInProgress: {
    id: 'app.components.aiAssistant.statusInProgress',
    defaultMessage: 'In progress: {tool}',
  },
  showDetails: {
    id: 'app.components.aiAssistant.showDetails',
    defaultMessage: 'Show details',
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
  errorToolBudgetExceeded: {
    id: 'app.components.aiAssistant.errorToolBudgetExceeded',
    defaultMessage:
      'The assistant needed too many steps for this request. Try a smaller request.',
  },
  errorConversationBusy: {
    id: 'app.components.aiAssistant.errorConversationBusy',
    defaultMessage:
      'The assistant is still working, or waiting for your decision on a proposed change.',
  },
  errorToolCallExpired: {
    id: 'app.components.aiAssistant.errorToolCallExpired',
    defaultMessage:
      'This proposal has expired. Ask the assistant again to get a new one.',
  },
  errorToolCallNotProposed: {
    id: 'app.components.aiAssistant.errorToolCallNotProposed',
    defaultMessage: 'A decision was already made on this proposal.',
  },
  errorAiProcessingNotAllowed: {
    id: 'app.components.aiAssistant.errorAiProcessingNotAllowed',
    defaultMessage: 'One of the files may not be shared with AI.',
  },
  errorUnsupportedFileType: {
    id: 'app.components.aiAssistant.errorUnsupportedFileType',
    defaultMessage:
      'Only PDF, Markdown (.md) and text (.txt) files of up to 4 MB can be used.',
  },
  errorTooLong: {
    id: 'app.components.aiAssistant.errorTooLong',
    defaultMessage: 'Your message is too long.',
  },
  errorUpload: {
    id: 'app.components.aiAssistant.errorUpload',
    defaultMessage: '{fileName} could not be uploaded.',
  },
  errorGeneric: {
    id: 'app.components.aiAssistant.errorGeneric',
    defaultMessage: 'Something went wrong. Please try again.',
  },
});
