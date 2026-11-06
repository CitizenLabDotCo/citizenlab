import React from 'react';

import {
  Box,
  Icon,
  Spinner,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import { AiAssistantConversationStatus } from 'api/ai_assistant_conversations/types';

import { useIntl } from 'utils/cl-intl';

import { Appear, PulsingDot } from '../animations';
import messages from '../messages';

type Props = {
  status: AiAssistantConversationStatus;
};

const DraftStatus = ({ status }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Appear key={status} display="flex" alignItems="center" gap="8px">
      {status === 'running' && (
        <>
          <Box width="14px">
            <Spinner size="14px" />
          </Box>
          <Text m="0px" fontSize="s" color="textSecondary">
            {formatMessage(messages.statusDrafting)}
          </Text>
        </>
      )}
      {status === 'awaiting_user' && (
        <>
          <PulsingDot />
          <Text m="0px" fontSize="s" color="teal700">
            {formatMessage(messages.statusReview)}
          </Text>
        </>
      )}
      {(status === 'idle' || status === 'failed') && (
        <>
          <Icon
            name="check-circle"
            width="16px"
            height="16px"
            fill={colors.green500}
          />
          <Text m="0px" fontSize="s" color="textSecondary">
            {formatMessage(messages.statusSaved)}
          </Text>
        </>
      )}
    </Appear>
  );
};

export default DraftStatus;
