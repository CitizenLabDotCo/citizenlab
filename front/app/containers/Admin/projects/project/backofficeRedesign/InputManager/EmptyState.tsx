import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const EmptyState = () => {
  const { formatMessage } = useIntl();

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
        {formatMessage(messages.noInputsTitle)}
      </Text>
      <Text m="0" fontSize="s" color="coolGrey600" textAlign="center">
        {formatMessage(messages.noInputsDescription)}
      </Text>
    </Box>
  );
};

export default EmptyState;
