import React from 'react';

// Components
import {
  Box,
  Icon,
  Text,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

export const PasswordResetSuccess = () => {
  const signIn = () => {
    triggerAuthenticationFlow({ flow: 'signin' });
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
      <Box display="flex" justifyContent="center">
        <Icon
          name="check-circle"
          fill={colors.green400}
          width="60px"
          height="60px"
        />
      </Box>
      <Text variant="bodyL" textAlign="center">
        <FormattedMessage {...messages.passwordUpdatedSuccessMessage} />
      </Text>
      <Text variant="bodyS" textAlign="center">
        <FormattedMessage {...messages.pleaseLogInMessage} />
      </Text>
      <Button onClick={signIn}>
        <FormattedMessage {...messages.login} />
      </Button>
    </Box>
  );
};
