import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const InitiativeCreatedModalContent = () => {
  const { formatMessage } = useIntl();
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Title styleVariant="h2" textAlign="center">
        {formatMessage(messages.createdModalTitle)}
      </Title>
      <Text
        color="textPrimary"
        mt="12px"
        marginX="36px"
        fontSize={'m'}
        textAlign="center"
      >
        {formatMessage(messages.createdModalSubtitle)}
      </Text>
    </Box>
  );
};

export default InitiativeCreatedModalContent;
