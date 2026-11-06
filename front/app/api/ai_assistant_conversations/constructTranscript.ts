import { IAiAssistantMessageData } from 'api/ai_assistant_messages/types';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';

import { groupIncludedResources } from 'utils/cl-react-query/groupIncludedResources';
import { indexById } from 'utils/cl-react-query/indexById';

import { IAiAssistantConversation } from './types';

type TranscriptEntry = {
  message: IAiAssistantMessageData;
  toolCalls: IAiAssistantToolCallData[];
};

// The conversation's messages in order, each with its tool calls.
export const constructTranscript = (
  conversation: IAiAssistantConversation
): TranscriptEntry[] => {
  const includedByType = groupIncludedResources(conversation.included);
  const messagesById = indexById(includedByType.ai_assistant_message ?? []);
  const toolCallsById = indexById(includedByType.ai_assistant_tool_call ?? []);

  return conversation.data.relationships.messages.data.map(({ id }) => {
    const message = messagesById[id];

    return {
      message,
      toolCalls: message.relationships.tool_calls.data.map(
        (toolCall) => toolCallsById[toolCall.id]
      ),
    };
  });
};
