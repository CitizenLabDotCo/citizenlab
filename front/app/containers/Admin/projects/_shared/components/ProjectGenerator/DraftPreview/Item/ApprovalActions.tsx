import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useApproveAiAssistantToolCall from 'api/ai_assistant_tool_calls/useApproveAiAssistantToolCall';
import useRejectAiAssistantToolCall from 'api/ai_assistant_tool_calls/useRejectAiAssistantToolCall';

import {
  getErrorMessage,
  getRequestErrorCode,
} from 'components/AiAssistant/errors';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { ProposedChange } from '../../draft';
import messages from '../../messages';
import useRefreshDraft from '../../useRefreshDraft';

import RefineForm from './RefineForm';

type Props = {
  change: ProposedChange;
  conversationId: string;
};

const ApprovalActions = ({ change, conversationId }: Props) => {
  const { formatMessage } = useIntl();
  const refreshDraft = useRefreshDraft();
  const [refining, setRefining] = useState(false);
  const {
    mutate: approve,
    isPending: approving,
    error: approveError,
  } = useApproveAiAssistantToolCall();
  const {
    mutate: reject,
    isPending: rejecting,
    error: rejectError,
  } = useRejectAiAssistantToolCall();

  const { toolCall, kind } = change;
  const error = approveError ?? rejectError;

  const refine = (request: string) =>
    reject({ id: toolCall.id, conversationId, reason: request });

  const handleApprove = () =>
    approve(
      { id: toolCall.id, conversationId },
      {
        onSuccess: (approved) => {
          if (approved.data.attributes.status === 'executed') refreshDraft();
        },
      }
    );

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      {refining ? (
        <RefineForm
          sending={rejecting}
          onSend={refine}
          onCancel={() => setRefining(false)}
        />
      ) : (
        <Box display="flex" gap="8px" justifyContent="flex-end">
          <ButtonWithLink
            type="button"
            buttonStyle="bo-secondary"
            height="30px"
            padding="0 12px"
            icon="edit"
            disabled={approving}
            onClick={() => setRefining(true)}
          >
            <FormattedMessage {...messages.refine} />
          </ButtonWithLink>
          <ButtonWithLink
            type="button"
            buttonStyle={kind === 'remove' ? 'bo-delete' : 'bo-primary'}
            height="30px"
            padding="0 12px"
            icon={kind === 'remove' ? 'delete' : 'check'}
            processing={approving}
            onClick={handleApprove}
          >
            <FormattedMessage
              {...(kind === 'remove' ? messages.remove : messages.approve)}
            />
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

export default ApprovalActions;
