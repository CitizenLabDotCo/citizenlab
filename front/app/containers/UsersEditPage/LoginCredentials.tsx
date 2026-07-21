import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IdMethodName } from 'api/id_methods/types';
import useIdMethods from 'api/id_methods/useIdMethods';
import { IUserData } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type PasswordChangeProps = {
  user: IUserData;
};

// SSO methods that don't return an email by default (email_always_present? ==
// false): users authenticated through these need to be able to set/change their
// email.
const SSO_METHODS_WITHOUT_EMAIL: IdMethodName[] = [
  'clave_unica',
  'id_austria',
  'nemlog_in',
  'acm',
  'criipto',
  'twoday',
];

const LoginCredentials = ({ user }: PasswordChangeProps) => {
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const smsEnabled = useFeatureFlag({ name: 'sms' });
  const { data: idMethods } = useIdMethods();

  const ssoWithoutEmailEnabled = !!idMethods?.data.some((method) =>
    SSO_METHODS_WITHOUT_EMAIL.includes(method.attributes.name)
  );

  const showChangePassword = passwordLoginEnabled;
  const showChangeEmail = passwordLoginEnabled || ssoWithoutEmailEnabled;
  const showChangePhone = smsEnabled;

  if (!showChangeEmail && !showChangePassword && !showChangePhone) return null;

  const userHasPreviousPassword = !user.attributes.no_password;

  const passwordChangeButtonText = !userHasPreviousPassword
    ? messages.addPassword
    : messages.changePassword2;

  const phoneNumberButtonText = !user.attributes.phone
    ? messages.addPhone
    : messages.changePhone;

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
        {showChangePhone && (
          <ButtonWithLink
            to="/profile/change-phone"
            scrollToTop
            width="auto"
            justifyWrapper="left"
            buttonStyle="secondary-outlined"
            icon="tablet"
          >
            <FormattedMessage {...phoneNumberButtonText} />
          </ButtonWithLink>
        )}
      </Box>
    </FormSection>
  );
};

export default LoginCredentials;
