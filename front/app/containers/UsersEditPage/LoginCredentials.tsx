import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import Button from 'components/UI/Button';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type PasswordChangeProps = {
  user: IUserData;
};

const LoginCredentials = ({ user }: PasswordChangeProps) => {
  const userHasPreviousPassword = !user.attributes.no_password;

  const passwordChangeButtonText = !userHasPreviousPassword
    ? messages.addPassword
    : messages.changePassword2;

  return (
    <FormSection>
      <FormSectionTitle
        message={messages.loginCredentialsTitle}
        subtitleMessage={messages.loginCredentialsSubtitle}
      />
      <Box display="flex" flexWrap="wrap" gap="16px">
        <Button
          linkTo="/profile/change-email"
          scrollToTop
          width="auto"
          justifyWrapper="left"
          buttonStyle="secondary"
          icon="email"
        >
          <FormattedMessage {...messages.changeEmail} />
        </Button>
        <Button
          linkTo="/profile/change-password"
          scrollToTop
          width="auto"
          justifyWrapper="left"
          buttonStyle="secondary"
          icon="lock"
        >
          <FormattedMessage {...passwordChangeButtonText} />
        </Button>
      </Box>
    </FormSection>
  );
};

export default LoginCredentials;
