import React, { useEffect, useRef } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { constructTranscript } from 'api/ai_assistant_conversations/constructTranscript';
import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';

import { useIntl } from 'utils/cl-intl';

import AssistantMessage from './AssistantMessage';
import { getErrorMessage } from './errors';
import ToolCallCard from './ToolCallCard';
import { AiAssistantToolViews } from './types';
import UserMessage from './UserMessage';
import WorkingIndicator from './WorkingIndicator';

type Props = {
  conversation: IAiAssistantConversation;
  toolViews: AiAssistantToolViews;
  onToolExecuted: (toolName: string) => void;
};

const Transcript = ({ conversation, toolViews, onToolExecuted }: Props) => {
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
                decidable={attributes.status === 'awaiting_approval'}
                view={toolViews[toolCall.attributes.name]}
                onExecuted={onToolExecuted}
              />
            ))}
          </Box>
        )
      )}
      {attributes.status === 'running' && (
        <WorkingIndicator startedAt={attributes.updated_at} />
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
