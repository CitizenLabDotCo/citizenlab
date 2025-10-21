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

const SummaryHeader = ({
  showAiWarning = true,
}: {
  showAiWarning?: boolean;
}) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" gap="8px" alignItems="center" w="fit-content">
      {showAiWarning && (
        <Tooltip
          content={
            <Box p="4px">{formatMessage(messages.aiSummaryTooltip)}</Box>
          }
          placement="bottom"
          zIndex={99999}
        >
          <Icon name="alert-circle" fill={colors.orange500} mr="4px" />
        </Tooltip>
      )}

      {!showAiWarning && <Icon name="stars" />}

      <Text m="0px" fontWeight="bold">
        {formatMessage(messages.aiSummary)}
      </Text>

      {showAiWarning && <Icon name="stars" />}
    </Box>
  );
};

export default SummaryHeader;
