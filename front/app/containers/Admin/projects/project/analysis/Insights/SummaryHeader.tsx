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
    <Box
      display="flex"
      gap="4px"
      alignItems="center"
      p="8px"
      mb="12px"
      w="fit-content"
    >
      <Tooltip
        content={<Box p="4px">{formatMessage(messages.aiSummaryTooltip)}</Box>}
        placement="bottom"
        zIndex={99999}
      >
        <Icon name="alert-circle" fill={colors.orange500} mr="4px" />
      </Tooltip>
      <Text m="0px" fontWeight="bold">
        {formatMessage(messages.aiSummary)}
      </Text>
      <Icon name="stars" />
    </Box>
  );
};

export default SummaryHeader;
