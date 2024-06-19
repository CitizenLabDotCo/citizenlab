import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const SummaryHeader = () => {
  const { formatMessage } = useIntl();

  return (
    <Tooltip
      content={<Box p="4px">{formatMessage(messages.aiSummaryTooltip)}</Box>}
      placement="top"
      zIndex={99999}
    >
      <Box
        display="flex"
        gap="4px"
        alignItems="center"
        p="8px"
        mb="12px"
        w="fit-content"
      >
        <Icon name="alert-circle" fill={colors.orange500} mr="4px" />
        <Text m="0px" fontWeight="bold">
          {formatMessage(messages.aiSummary)}
        </Text>
        <Icon name="stars" />
      </Box>
    </Tooltip>
  );
};

export default SummaryHeader;
