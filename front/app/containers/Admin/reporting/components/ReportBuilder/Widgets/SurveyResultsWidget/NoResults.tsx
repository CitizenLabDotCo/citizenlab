import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

const NoResults = () => {
  const { formatMessage } = useIntl();

  return (
    <Box px="20px" width="100%" display="flex" flexDirection="row">
      <Text variant="bodyM" color="textSecondary">
        {formatMessage(messages.surveyNoResults)}
      </Text>
    </Box>
  );
};

export default NoResults;
