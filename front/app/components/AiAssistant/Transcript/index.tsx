import React, { useEffect, useRef } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { constructTranscript } from 'api/ai_assistant_conversations/constructTranscript';
import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import { AiAssistantToolName } from 'api/ai_assistant_tool_calls/types';

import { useIntl } from 'utils/cl-intl';

import { getErrorMessage } from '../errors';
import { AiAssistantToolDisplays } from '../types';

import AssistantMessage from './AssistantMessage';
import ToolCallCard from './ToolCallCard';
import UserMessage from './UserMessage';
import WorkingIndicator from './WorkingIndicator';

type Props = {
  conversation: IAiAssistantConversation;
  toolDisplays: AiAssistantToolDisplays;
  onToolExecuted: (toolName: AiAssistantToolName) => void;
};

const Transcript = ({ conversation, toolDisplays, onToolExecuted }: Props) => {
  const { formatMessage } = useIntl();
  const endRef = useRef<HTMLDivElement>(null);
  const { attributes } = conversation.data;
  const transcript = constructTranscript(conversation);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [transcript.length, attributes.status]);

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {transcript.map(({ message, toolCalls }) =>
        message.attributes.role === 'user' ? (
          <UserMessage
            key={message.id}
            content={message.attributes.content}
            fileIds={message.attributes.file_ids}
          />
        ) : (
          <Box key={message.id} display="flex" flexDirection="column" gap="8px">
            {message.attributes.content && (
              <AssistantMessage content={message.attributes.content} />
            )}
            {toolCalls.map((toolCall) => (
              <ToolCallCard
                key={toolCall.id}
                toolCall={toolCall}
                conversationId={conversation.data.id}
                decidable={attributes.status === 'awaiting_user'}
                display={toolDisplays[toolCall.attributes.name]}
                onExecuted={onToolExecuted}
              />
            ))}
          </Box>
        )
      )}
      {attributes.status === 'running' && (
        <WorkingIndicator startedAt={attributes.turn_started_at} />
      )}
      {attributes.status === 'failed' && (
        <Text m="0px" color="error">
          {formatMessage(getErrorMessage(attributes.last_error_code))}
        </Text>
      )}
      <div ref={endRef} />
    </Box>
  );
};

export default Transcript;
