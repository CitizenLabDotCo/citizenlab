import { MessageDescriptor } from 'react-intl';

import { isCLErrorsWrapper } from 'utils/errorUtils';

import messages from './messages';

// The first machine-readable error code of a failed request.
export const getRequestErrorCode = (error: unknown) =>
  isCLErrorsWrapper(error)
    ? Object.values(error.errors).flat().at(0)?.error
    : undefined;

// Error codes of failed turns (the conversation's last_error_code) and of refused
// requests.
export const getErrorMessage = (
  code: string | undefined
): MessageDescriptor => {
  switch (code) {
    case 'llm_unavailable':
      return messages.errorLlmUnavailable;
    case 'llm_request_rejected':
      return messages.errorLlmRequestRejected;
    case 'context_too_long':
      return messages.errorContextTooLong;
    case 'context_unavailable':
      return messages.errorContextUnavailable;
    case 'tool_budget_exceeded':
      return messages.errorToolBudgetExceeded;
    case 'conversation_busy':
      return messages.errorConversationBusy;
    case 'tool_call_expired':
      return messages.errorToolCallExpired;
    case 'tool_call_not_proposed':
      return messages.errorToolCallNotProposed;
    case 'too_long':
      return messages.errorTooLong;
    default:
      return messages.errorGeneric;
  }
};
