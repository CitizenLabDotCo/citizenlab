import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  formCompletionPercentage?: number;
}

const ProgressBar = ({ formCompletionPercentage = 0 }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Box
      w="100%"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={formCompletionPercentage}
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
    </Box>
  );
};

export default ProgressBar;
