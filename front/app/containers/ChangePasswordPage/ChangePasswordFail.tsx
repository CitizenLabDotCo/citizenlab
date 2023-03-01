import React from 'react';

// Components
import { Box, Text, Button } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import clHistory from 'utils/cl-router/history';

export default () => {
  const signIn = () => {
    clHistory.push('/sign-in');
  };

  return (
    <Box
      display="flex"
      maxWidth="380px"
      px="20px"
      width="100%"
      marginLeft="auto"
      marginRight="auto"
      flexDirection="column"
      mt="60px"
    >
      <Text variant="bodyL" textAlign="center">
        <FormattedMessage {...messages.passwordChangeFailMessage} />
      </Text>
      <Text variant="bodyS" textAlign="center">
        <FormattedMessage {...messages.pleaseLogInAgainMessage} />
      </Text>
      <Button onClick={signIn}>
        <FormattedMessage {...messages.login} />
      </Button>
    </Box>
  );
};
