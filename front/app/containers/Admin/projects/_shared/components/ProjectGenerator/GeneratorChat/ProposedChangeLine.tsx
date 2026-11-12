import React from 'react';

import { Box, Text, bo, colors } from '@citizenlab/cl2-component-library';

import {
  AiAssistantToolCallStatus,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';
import { isToolCall } from 'api/ai_assistant_tool_calls/utils';

import useLocalize from 'hooks/useLocalize';

import UserMessage from 'components/AiAssistant/Transcript/UserMessage';
import { AiAssistantToolCardProps } from 'components/AiAssistant/types';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { Appear } from '../animations';
import { scrollToChange } from '../draft';
import messages from '../messages';

import ToolCallStatusIcon from './ToolCallStatusIcon';

const STATUS_MESSAGES: Partial<
  Record<AiAssistantToolCallStatus, MessageDescriptor>
> = {
  awaiting_user: messages.changeWaiting,
  approved: messages.changeApplying,
  executed: messages.changeApproved,
  auto_executed: messages.changeApplied,
  rejected: messages.changeRefined,
  failed: messages.changeFailed,
  expired: messages.changeExpired,
};

const proposedTitle = (toolCall: IAiAssistantToolCallData) => {
  if (
    isToolCall(
      toolCall,
      'update_project',
      'create_phase',
      'update_phase',
      'create_event'
    )
  ) {
    return toolCall.attributes.arguments.title_multiloc;
  }
  if (isToolCall(toolCall, 'update_resource')) {
    return toolCall.attributes.arguments.attributes.title_multiloc;
  }
  return undefined;
};

const ProposedChangeLine = ({
  toolCall,
  conversation,
  label,
}: AiAssistantToolCardProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { status, reason, decided_at } = toolCall.attributes;

  // The backend refused it before the admin saw it, and the assistant fixes that itself.
  if (status === 'failed' && !decided_at) return null;

  const statusMessage = STATUS_MESSAGES[status];
  const waiting =
    status === 'awaiting_user' &&
    conversation.data.attributes.status === 'awaiting_user';
  const title = proposedTitle(toolCall);

  return (
    <Appear display="flex" flexDirection="column" gap="8px">
      <Box
        display="flex"
        alignItems="center"
        gap="10px"
        px="12px"
        py="10px"
        bgColor={waiting ? colors.teal50 : colors.white}
        border={`1px solid ${waiting ? colors.teal200 : colors.grey300}`}
        borderRadius={bo.borderRadius}
      >
        <Box width="16px" display="flex" justifyContent="center" flexShrink={0}>
          <ToolCallStatusIcon status={status} />
        </Box>
        <Box flex="1" minWidth="0">
          <Text m="0px" fontSize="s" fontWeight="semi-bold">
            {formatMessage(label)}
            {title && `: ${localize(title)}`}
          </Text>
          {statusMessage && (
            <Text m="0px" fontSize="xs" color="textSecondary">
              {formatMessage(statusMessage)}
            </Text>
          )}
        </Box>
        {waiting && (
          <ButtonWithLink
            type="button"
            buttonStyle="bo-text"
            height="28px"
            padding="0 4px"
            icon="arrow-right"
            iconPos="right"
            textColor={colors.teal700}
            iconColor={colors.teal700}
            onClick={() => scrollToChange(toolCall.id)}
          >
            {formatMessage(messages.reviewInDraft)}
          </ButtonWithLink>
        )}
      </Box>
      {status === 'rejected' && reason && (
        <UserMessage content={reason} fileIds={[]} />
      )}
    </Appear>
  );
};

export default ProposedChangeLine;
