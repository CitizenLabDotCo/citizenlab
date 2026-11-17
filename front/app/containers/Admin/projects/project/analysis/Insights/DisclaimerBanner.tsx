import React, { useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ClickableBox = styled(Box)`
  cursor: pointer;
`;

const HiddenIcon = styled(Icon).attrs({
  'aria-hidden': 'true',
})`
  visibility: hidden;
`;

const DisclaimerBanner = () => {
  const { formatMessage } = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);
  const shared_gap = '8px';

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="8px"
      p="8px"
      background={colors.orange100}
      borderRadius="3px"
    >
      <ClickableBox
        display="flex"
        gap={shared_gap}
        alignItems="center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Icon name="alert-circle" fill={colors.orange500} />
        <Box flex="1">
          <Text fontSize="s" m="0px" color="textSecondary">
            {formatMessage(messages.aiDisclaimerBanner)}
          </Text>
        </Box>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          fill={colors.textSecondary}
        />
      </ClickableBox>

      {isExpanded && (
        <Box display="flex" gap={shared_gap}>
          <HiddenIcon name="alert-circle" fill={colors.orange500} />
          <Box flex="1">
            <Text fontSize="s" m="0px" color="textSecondary">
              {formatMessage(messages.aiDisclaimerDetails)}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DisclaimerBanner;
