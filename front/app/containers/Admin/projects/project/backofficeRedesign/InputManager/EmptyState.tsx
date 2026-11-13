import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useInputTermLabels from './useInputTermLabels';

const EmptyState = () => {
  const { formatMessage } = useIntl();
  const { terms, capitalizedTerms } = useInputTermLabels();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      py="80px"
      gap="8px"
    >
      <Icon name="idea" width="48px" height="48px" fill={colors.grey400} />
      <Text m="0" fontWeight="semi-bold" textAlign="center">
        {formatMessage(messages.noTermsTitle, { terms: capitalizedTerms })}
      </Text>
      <Text variant="boHelper" m="0" textAlign="center">
        {formatMessage(messages.noTermsDescription, { terms })}
      </Text>
    </Box>
  );
};

export default EmptyState;
