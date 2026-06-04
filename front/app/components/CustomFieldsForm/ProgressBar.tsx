import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  formCompletionPercentage?: number;
}

const ProgressBar = ({ formCompletionPercentage = 0 }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const roundedPercentage = Math.round(formCompletionPercentage);

  return (
    <Box
      w="100%"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={roundedPercentage}
      aria-label={formatMessage(messages.progressBarLabel)}
    >
      <Box background={colors.background}>
        <Box
          w={`${formCompletionPercentage}%`}
          h="4px"
          background={theme.colors.tenantSecondary}
          style={{ transition: 'width 0.3s ease-in-out' }}
        />
      </Box>
      <Text
        m="0"
        fontSize="s"
        color="textSecondary"
        position="absolute"
        top="4px"
        left="0"
        right="0"
        textAlign="center"
      >
        {formatMessage(messages.progressPercentage, {
          percentage: roundedPercentage,
        })}
      </Text>
    </Box>
  );
};

export default ProgressBar;
