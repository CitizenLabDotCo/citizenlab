import React from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  lastUsedAt: string | null;
  lastUserAgent: string | null;
}

const LastUsedCell = ({ lastUsedAt, lastUserAgent }: Props) => {
  const { formatMessage, formatDate } = useIntl();

  if (!lastUsedAt) return null;

  const userAgentTooltip = lastUserAgent
    ? formatMessage(messages.lastUserAgent, { userAgent: lastUserAgent })
    : undefined;

  return (
    <Tooltip
      content={userAgentTooltip}
      disabled={!userAgentTooltip}
      placement="top"
      theme="dark"
    >
      <Box as="span">{formatDate(lastUsedAt)}</Box>
    </Tooltip>
  );
};

export default LastUsedCell;
