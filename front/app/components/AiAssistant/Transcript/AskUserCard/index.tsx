import React from 'react';

import { Box, bo, colors } from '@citizenlab/cl2-component-library';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';
import { isToolCall } from 'api/ai_assistant_tool_calls/utils';

import AskUserAnswers from './AskUserAnswers';
import AskUserForm from './AskUserForm';

type Props = {
  toolCall: IAiAssistantToolCallData;
  conversation: IAiAssistantConversation;
};

const AskUserCard = ({ toolCall, conversation }: Props) => {
  if (!isToolCall(toolCall, 'ask_user')) return null;

  const { status, answers } = toolCall.attributes;
  const { questions } = toolCall.attributes.arguments;
  const answerable =
    status === 'awaiting_user' &&
    conversation.data.attributes.status === 'awaiting_user';

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="16px"
      p="16px"
      bgColor={colors.white}
      border={`1px solid ${answerable ? colors.teal200 : colors.grey300}`}
      borderRadius={bo.borderRadius}
    >
      {answerable ? (
        <AskUserForm
          questions={questions}
          toolCallId={toolCall.id}
          conversationId={conversation.data.id}
        />
      ) : (
        <AskUserAnswers questions={questions} answers={answers} />
      )}
    </Box>
  );
};

export default AskUserCard;
