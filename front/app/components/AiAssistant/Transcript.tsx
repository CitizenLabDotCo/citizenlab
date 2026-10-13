import React, { useEffect, useRef } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import { IAiAssistantMessageData } from 'api/ai_assistant_messages/types';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';

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
};

const isMessage = (
  resource: IAiAssistantMessageData | IAiAssistantToolCallData
): resource is IAiAssistantMessageData =>
  resource.type === 'ai_assistant_message';

const isToolCall = (
  resource: IAiAssistantMessageData | IAiAssistantToolCallData
): resource is IAiAssistantToolCallData =>
  resource.type === 'ai_assistant_tool_call';

const Transcript = ({ conversation, toolViews }: Props) => {
  const { formatMessage } = useIntl();
  const endRef = useRef<HTMLDivElement>(null);
  const { attributes } = conversation.data;

  const messages = conversation.included
    .filter(isMessage)
    .sort((a, b) => a.attributes.position - b.attributes.position);
  const toolCallsById = new Map(
    conversation.included
      .filter(isToolCall)
      .map((toolCall) => [toolCall.id, toolCall])
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages.length, attributes.status]);

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {messages.map((message) =>
        message.attributes.role === 'user' ? (
          <UserMessage key={message.id} content={message.attributes.content} />
        ) : (
          <Box key={message.id} display="flex" flexDirection="column" gap="8px">
            {message.attributes.content && (
              <AssistantMessage content={message.attributes.content} />
            )}
            {message.relationships.tool_calls.data.map(({ id }) => {
              const toolCall = toolCallsById.get(id);
              if (!toolCall) return null;

              return (
                <ToolCallCard
                  key={id}
                  toolCall={toolCall}
                  view={toolViews[toolCall.attributes.name]}
                />
              );
            })}
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
