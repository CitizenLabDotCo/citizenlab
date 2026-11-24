import React, { useEffect, useRef } from 'react';

import { Box, Spinner, Text, colors } from '@citizenlab/cl2-component-library';

import { ReportChatTurn } from 'api/report_chat/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  turns: ReportChatTurn[];
  pending: boolean;
}

const Transcript = ({ turns, pending }: Props) => {
  const bottom = useRef<HTMLDivElement>(null);

  // Follow the conversation as it grows, the way a chat is expected to behave.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [turns.length, pending]);

  if (turns.length === 0 && !pending) {
    return (
      <Text color="textSecondary" fontSize="s">
        <FormattedMessage {...messages.emptyState} />
      </Text>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {turns.map((turn, index) => (
        <Box
          key={`${turn.at}-${index}`}
          p="12px"
          borderRadius="3px"
          background={turn.role === 'user' ? colors.grey100 : colors.background}
          border={
            turn.role === 'user' ? 'none' : `1px solid ${colors.borderLight}`
          }
        >
          <Text m="0" fontSize="s" color="textPrimary">
            {turn.text}
          </Text>
        </Box>
      ))}
      {pending && (
        <Box display="flex" alignItems="center" gap="8px" p="12px">
          <Spinner size="16px" />
          <Text m="0" fontSize="s" color="textSecondary">
            <FormattedMessage {...messages.working} />
          </Text>
        </Box>
      )}
      <div ref={bottom} />
    </Box>
  );
};

export default Transcript;
