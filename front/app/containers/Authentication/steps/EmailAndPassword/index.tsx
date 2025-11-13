import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { SetError } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import TextButton from '../_components/TextButton';
import authMessages from '../messages';

import Form from './Form';
import messages from './messages';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (
    email: string,
    password: string,
    rememberMe: boolean,
    tokenLifetime: number
  ) => void;
  onGoBack: () => void;
  onSwitchFlow: () => void;
  closeModal: () => void;
}

const EmailAndPassword = ({
  loading,
  setError,
  onSubmit,
  onGoBack,
  onSwitchFlow,
  closeModal,
}: Props) => {
  const { anySSOProviderEnabled } = useAuthConfig();
  const { formatMessage } = useIntl();
  const { data: tenant } = useAppConfiguration();
  const tenantSettings = tenant?.data.attributes.settings;

  // Show link to the Azure AD button?
  const showAdminLoginLink =
    tenantSettings?.azure_ad_login?.visibility === 'link';

  return (
    <Box id="e2e-sign-in-email-password-container">
      <Form
        loading={loading}
        setError={setError}
        onSubmit={onSubmit}
        closeModal={closeModal}
      />
      <Text mt="12px">
        {anySSOProviderEnabled ? (
          <TextButton
            id="e2e-login-options"
            onClick={onGoBack}
            className="link"
          >
            {formatMessage(messages.goBackToLoginOptions)}
          </TextButton>
        ) : (
          <FormattedMessage
            {...messages.goToSignUp}
            values={{
              goToOtherFlowLink: (
                <TextButton
                  id="e2e-goto-signup"
                  onClick={onSwitchFlow}
                  className="link"
                >
                  {formatMessage(messages.signUp)}
                </TextButton>
              ),
            }}
          />
        )}
      </Text>
      {showAdminLoginLink && (
        <a href="/sign-in/admin">
          <Text fontSize="xs" textDecoration="underline" color="textSecondary">
            <FormattedMessage {...authMessages.adminOptions} />
          </Text>
        </a>
      )}
    </Box>
  );
};

export default EmailAndPassword;
