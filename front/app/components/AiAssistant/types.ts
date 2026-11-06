import { ComponentType } from 'react';

import { MessageDescriptor } from 'react-intl';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import {
  AiAssistantToolName,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';

export type AiAssistantToolCardProps = {
  toolCall: IAiAssistantToolCallData;
  conversation: IAiAssistantConversation;
  label: MessageDescriptor;
};

// How a feature presents one of its tools in the assistant panel.
export type AiAssistantToolDisplay = {
  label: MessageDescriptor;
  // Shows what an approved call would do. Narrow it with isToolCall to read its arguments.
  Preview?: ComponentType<{ toolCall: IAiAssistantToolCallData }>;
  approveWarning?: MessageDescriptor;
  // Replaces the standard card, for tools that are decided on outside the chat.
  CustomCard?: ComponentType<AiAssistantToolCardProps>;
};

export type AiAssistantToolDisplays = Partial<
  Record<AiAssistantToolName, AiAssistantToolDisplay>
>;
