import React, { useEffect, useRef } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { constructTranscript } from 'api/ai_assistant_conversations/constructTranscript';
import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import { AiAssistantToolName } from 'api/ai_assistant_tool_calls/types';

import { useIntl } from 'utils/cl-intl';

import { getErrorMessage } from '../errors';
import { AiAssistantToolDisplays } from '../types';

import AssistantMessage from './AssistantMessage';
import TranscriptToolCall from './TranscriptToolCall';
import { getTurnStartId } from './turnStart';
import UserMessage from './UserMessage';
import WorkingIndicator from './WorkingIndicator';

type Props = {
  conversation: IAiAssistantConversation;
  toolDisplays: AiAssistantToolDisplays;
  onToolExecuted: (toolName: AiAssistantToolName) => void;
};

const Transcript = ({ conversation, toolDisplays, onToolExecuted }: Props) => {
  const { formatMessage } = useIntl();
  const turnStartRef = useRef<HTMLDivElement>(null);
  const { attributes } = conversation.data;
  const transcript = constructTranscript(conversation);
  const turnStartId = getTurnStartId(transcript);

  // Shows each turn from its start, and leaves the scrolling to the admin while it goes on.
  useEffect(() => {
    turnStartRef.current?.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    });
  }, [turnStartId]);

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {transcript.map(({ message, toolCalls }) => (
        <Box
          key={message.id}
          ref={message.id === turnStartId ? turnStartRef : undefined}
          display="flex"
          flexDirection="column"
          gap="8px"
        >
          {message.attributes.role === 'user' ? (
            <UserMessage
              content={message.attributes.content}
              fileIds={message.attributes.file_ids}
            />
          ) : (
            <>
              {message.attributes.content && (
                <AssistantMessage content={message.attributes.content} />
              )}
              {toolCalls.map((toolCall) => (
                <TranscriptToolCall
                  key={toolCall.id}
                  toolCall={toolCall}
                  conversation={conversation}
                  toolDisplays={toolDisplays}
                  onToolExecuted={onToolExecuted}
                />
              ))}
            </>
          )}
        </Box>
      ))}
      {attributes.status === 'running' && (
        <WorkingIndicator startedAt={attributes.turn_started_at} />
      )}
      {attributes.status === 'failed' && (
        <Text m="0px" color="error">
          {formatMessage(getErrorMessage(attributes.last_error_code))}
        </Text>
      )}
    </Box>
  );
};

export default Transcript;
