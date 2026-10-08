import React, { useEffect, useRef } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';

import { useIntl } from 'utils/cl-intl';

import AssistantMessage from './AssistantMessage';
import { getErrorMessage } from './errors';
import UserMessage from './UserMessage';
import WorkingIndicator from './WorkingIndicator';

type Props = {
  conversation: IAiAssistantConversation;
};

const Transcript = ({ conversation }: Props) => {
  const { formatMessage } = useIntl();
  const endRef = useRef<HTMLDivElement>(null);
  const { attributes } = conversation.data;

  const messages = [...conversation.included].sort(
    (a, b) => a.attributes.position - b.attributes.position
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
