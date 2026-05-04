import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type PasswordChangeProps = {
  user: IUserData;
};

const LoginCredentials = ({ user }: PasswordChangeProps) => {
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });

  // Also need to show the change email button for SSO methods that don't return an email by default (email_always_present? == false)
  const claveUnicaEnabled = useFeatureFlag({ name: 'clave_unica_login' });
  const idAustriaEnabled = useFeatureFlag({ name: 'id_austria_login' });
  const nemloginEnabled = useFeatureFlag({ name: 'nemlog_in_login' });
  const acmEnabled = useFeatureFlag({ name: 'acm_login' });
  const criiptoEnabled = useFeatureFlag({ name: 'criipto_login' });
  const twodayEnabled = useFeatureFlag({ name: 'twoday_login' });

  const showChangePassword = passwordLoginEnabled;
  const showChangeEmail =
    passwordLoginEnabled ||
    claveUnicaEnabled ||
    idAustriaEnabled ||
    nemloginEnabled ||
    acmEnabled ||
    criiptoEnabled ||
    twodayEnabled;

  if (!showChangeEmail && !showChangePassword) return null;

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
        <ButtonWithLink
          to="/profile/change-email"
          scrollToTop
          width="auto"
          justifyWrapper="left"
          buttonStyle="secondary-outlined"
          icon="email"
        >
          <FormattedMessage {...messages.changeEmail} />
        </ButtonWithLink>
        {showChangePassword && (
          <ButtonWithLink
            to="/profile/change-password"
            scrollToTop
            width="auto"
            justifyWrapper="left"
            buttonStyle="secondary-outlined"
            icon="lock"
          >
            <FormattedMessage {...passwordChangeButtonText} />
          </ButtonWithLink>
        )}
      </Box>
    </FormSection>
  );
};

export default LoginCredentials;
