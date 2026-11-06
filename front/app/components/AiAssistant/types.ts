import { ComponentType } from 'react';

import { MessageDescriptor } from 'react-intl';

import {
  AiAssistantToolName,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';

// How a feature presents one of its tools in the assistant panel.
export type AiAssistantToolDisplay = {
  label: MessageDescriptor;
  // Shows what an approved call would do. Narrow it with isToolCall to read its arguments.
  Preview?: ComponentType<{ toolCall: IAiAssistantToolCallData }>;
  approveWarning?: MessageDescriptor;
};

export type AiAssistantToolDisplays = Partial<
  Record<AiAssistantToolName, AiAssistantToolDisplay>
>;
