import React, { useState } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import {
  AiAssistantToolCallStatus,
  AiAssistantToolName,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';
import useApproveAiAssistantToolCall from 'api/ai_assistant_tool_calls/useApproveAiAssistantToolCall';
import useRejectAiAssistantToolCall from 'api/ai_assistant_tool_calls/useRejectAiAssistantToolCall';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import TextArea from 'components/UI/TextArea';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { getErrorMessage, getRequestErrorCode } from '../errors';
import messages from '../messages';
import { AiAssistantToolDisplay } from '../types';

type Props = {
  toolCall: IAiAssistantToolCallData;
  conversationId: string;
  // Only calls awaiting the user in a conversation that waits for a decision can be decided on.
  decidable: boolean;
  display: AiAssistantToolDisplay | undefined;
  onExecuted: (toolName: AiAssistantToolName) => void;
};

const statusLine = (
  status: AiAssistantToolCallStatus
): { icon: IconNames; color: string; message: MessageDescriptor } => {
  switch (status) {
    case 'auto_executed':
      return {
        icon: 'check-circle',
        color: colors.textSecondary,
        message: messages.statusAutoExecuted,
      };
    case 'executed':
      return {
        icon: 'check-circle',
        color: colors.success,
        message: messages.statusExecuted,
      };
    case 'rejected':
      return {
        icon: 'close',
        color: colors.textSecondary,
        message: messages.statusRejected,
      };
    case 'failed':
      return {
        icon: 'alert-circle',
        color: colors.error,
        message: messages.statusFailed,
      };
    case 'expired':
      return {
        icon: 'clock',
        color: colors.textSecondary,
        message: messages.statusExpired,
      };
    default:
      return {
        icon: 'clock',
        color: colors.textSecondary,
        message: messages.statusInProgress,
      };
  }
};

const ToolCallCard = ({
  toolCall,
  conversationId,
  decidable,
  display,
  onExecuted,
}: Props) => {
  const { formatMessage } = useIntl();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const {
    mutate: approve,
    isPending: approving,
    error: approveError,
  } = useApproveAiAssistantToolCall();
  const {
    mutate: reject,
    isPending: rejectPending,
    error: rejectError,
  } = useRejectAiAssistantToolCall();

  const { name, status, arguments: args } = toolCall.attributes;
  const toolLabel = display ? formatMessage(display.label) : name;

  if (status !== 'awaiting_user' || !decidable) {
    const { icon, color, message } = statusLine(status);
    return (
      <Box display="flex" alignItems="center" gap="6px">
        <Icon name={icon} width="16px" height="16px" fill={color} />
        <Text m="0px" fontSize="s" color="textSecondary">
          {formatMessage(message, { tool: toolLabel })}
        </Text>
      </Box>
    );
  }

  const error = approveError ?? rejectError;
  const Preview = display?.Preview;

  return (
    <Box
      p="12px"
      bgColor={colors.white}
      border={`1px solid ${colors.teal400}`}
      borderRadius={bo.borderRadius}
      display="flex"
      flexDirection="column"
      gap="12px"
    >
      <Text m="0px" fontWeight="bold">
        <FormattedMessage {...messages.proposedChange} />: {toolLabel}
      </Text>

      {Preview ? (
        <Preview toolCall={toolCall} />
      ) : (
        <Box>
          <ButtonWithLink
            type="button"
            buttonStyle="bo-text"
            padding="0"
            onClick={() => setShowDetails(!showDetails)}
          >
            <FormattedMessage {...messages.showDetails} />
          </ButtonWithLink>
          {showDetails && (
            <Text m="0px" fontSize="xs" whiteSpace="pre-wrap">
              {JSON.stringify(args, null, 2)}
            </Text>
          )}
        </Box>
      )}

      {display?.approveWarning && (
        <Warning variant="bo">
          <FormattedMessage {...display.approveWarning} />
        </Warning>
      )}

      {rejecting ? (
        <Box display="flex" flexDirection="column" gap="8px">
          <TextArea
            variant="bo"
            label={formatMessage(messages.rejectReasonLabel)}
            value={reason}
            onChange={setReason}
            rows={2}
          />
          <Box display="flex" gap="8px" justifyContent="flex-end">
            <ButtonWithLink
              type="button"
              buttonStyle="bo-secondary"
              boSize="medium"
              onClick={() => setRejecting(false)}
            >
              <FormattedMessage {...messages.cancel} />
            </ButtonWithLink>
            <ButtonWithLink
              type="button"
              buttonStyle="bo-primary"
              boSize="medium"
              processing={rejectPending}
              onClick={() =>
                reject({ id: toolCall.id, conversationId, reason })
              }
            >
              <FormattedMessage {...messages.confirmReject} />
            </ButtonWithLink>
          </Box>
        </Box>
      ) : (
        <Box display="flex" gap="8px" justifyContent="flex-end">
          <ButtonWithLink
            type="button"
            buttonStyle="bo-secondary"
            boSize="medium"
            disabled={approving}
            onClick={() => setRejecting(true)}
          >
            <FormattedMessage {...messages.reject} />
          </ButtonWithLink>
          <ButtonWithLink
            type="button"
            buttonStyle="bo-primary"
            boSize="medium"
            icon="check"
            processing={approving}
            onClick={() =>
              approve(
                { id: toolCall.id, conversationId },
                {
                  onSuccess: (approved) => {
                    if (approved.data.attributes.status === 'executed') {
                      onExecuted(name);
                    }
                  },
                }
              )
            }
          >
            <FormattedMessage {...messages.approve} />
          </ButtonWithLink>
        </Box>
      )}

      {error && (
        <Text m="0px" fontSize="s" color="error">
          {formatMessage(getErrorMessage(getRequestErrorCode(error)))}
        </Text>
      )}
    </Box>
  );
};

export default ToolCallCard;
