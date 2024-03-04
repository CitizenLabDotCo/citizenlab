import React from 'react';

import { Box, Title, Text, Button } from '@citizenlab/cl2-component-library';

import messages from './messages';

import { useIntl } from 'utils/cl-intl';

import clHistory from 'utils/cl-router/history';

const CancelUpdate = () => {
  const { formatMessage } = useIntl();
  return (
    <Box maxWidth="350px" mx="auto">
      <Title textAlign="center" style={{ marginBottom: '0px' }}>
        {formatMessage(messages.emailUpdateCancelled)}
      </Title>
      <Text textAlign="center">
        {formatMessage(messages.emailUpdateCancelledDescription)}
      </Text>
      <Button
        text={formatMessage(messages.backToProfile)}
        onClick={() => {
          clHistory.goBack();
        }}
      />
    </Box>
  );
};

export default CancelUpdate;
