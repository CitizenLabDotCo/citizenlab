import React from 'react';

// components
import { Text, Box, Button, colors } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const EmptyState = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Text color="textSecondary">
        {formatMessage(messages.createAReportTo)}
        <ul>
          <li>{formatMessage(messages.shareResults)}</li>
          <li>{formatMessage(messages.createAMoreComplex)}</li>
        </ul>
        {formatMessage(messages.thisWillBe)}
      </Text>
      <Box w="100%" mt="32px" display="flex">
        <Button icon="reports" bgColor={colors.primary} width="auto">
          {formatMessage(messages.createReport)}
        </Button>
      </Box>
    </>
  );
};

export default EmptyState;
