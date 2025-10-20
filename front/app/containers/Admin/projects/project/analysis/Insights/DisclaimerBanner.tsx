import React, { useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const DisclaimerBanner = () => {
  const { formatMessage } = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="8px"
      p="8px"
      background={colors.orange100}
      borderRadius="3px"
    >
      <Box
        display="flex"
        gap="8px"
        alignItems="center"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <Icon name="alert-circle" fill={colors.orange500} />
        <Text fontSize="s" m="0px" color="textSecondary" style={{ flex: 1 }}>
          {formatMessage(messages.aiDisclaimerBanner)}
        </Text>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          fill={colors.textSecondary}
        />
      </Box>
      {isExpanded && (
        <Box display="flex" gap="8px" alignItems="flex-start">
          <Icon
            name="alert-circle"
            fill={colors.orange500}
            style={{ visibility: 'hidden' }}
            aria-hidden="true"
          />
          <Text fontSize="s" m="0px" color="textSecondary" style={{ flex: 1 }}>
            {formatMessage(messages.aiSummaryTooltip)}
          </Text>
          <Icon
            name="chevron-up"
            fill={colors.textSecondary}
            style={{ visibility: 'hidden' }}
            aria-hidden="true"
          />
        </Box>
      )}
    </Box>
  );
};

export default DisclaimerBanner;
