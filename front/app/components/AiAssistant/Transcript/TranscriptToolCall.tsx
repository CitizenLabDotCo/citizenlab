import React from 'react';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import {
  AiAssistantToolName,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';

import { AiAssistantToolDisplays } from '../types';

import AskUserCard from './AskUserCard';
import ToolCallCard from './ToolCallCard';

type Props = {
  toolCall: IAiAssistantToolCallData;
  conversation: IAiAssistantConversation;
  toolDisplays: AiAssistantToolDisplays;
  onToolExecuted: (toolName: AiAssistantToolName) => void;
};

const TranscriptToolCall = ({
  toolCall,
  conversation,
  toolDisplays,
  onToolExecuted,
}: Props) => {
  if (toolCall.attributes.name === 'ask_user') {
    return <AskUserCard toolCall={toolCall} conversation={conversation} />;
  }

  return (
    <ToolCallCard
      toolCall={toolCall}
      conversationId={conversation.data.id}
      decidable={conversation.data.attributes.status === 'awaiting_user'}
      display={toolDisplays[toolCall.attributes.name]}
      onExecuted={onToolExecuted}
    />
  );
};

export default TranscriptToolCall;
