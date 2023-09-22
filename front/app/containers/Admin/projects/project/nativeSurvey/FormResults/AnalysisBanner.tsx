import React from 'react';

import {
  Icon,
  colors,
  Text,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const AnalysisLaunchButton = () => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderColor={colors.borderLight}
      borderRadius="3px"
      borderWidth="1px"
      borderStyle="solid"
      p="8px 16px"
      mb="36px"
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="flash" width="50px" height="50px" fill={colors.orange} />
        <Box>
          <Title variant="h3">{formatMessage(messages.analysisTitle)}</Title>
          <Text>{formatMessage(messages.analysisSubtitle)}</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default AnalysisLaunchButton;
