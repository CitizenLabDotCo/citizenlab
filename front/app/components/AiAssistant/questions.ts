import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';
import { isToolCall } from 'api/ai_assistant_tool_calls/utils';

export const hasOpenQuestions = (toolCalls: IAiAssistantToolCallData[]) =>
  toolCalls.some(
    (toolCall) =>
      isToolCall(toolCall, 'ask_user') &&
      toolCall.attributes.status === 'awaiting_user'
  );
