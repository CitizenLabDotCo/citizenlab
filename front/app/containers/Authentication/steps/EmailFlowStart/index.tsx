import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';

import oldMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';
import { SetError } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import FranceConnectButton from 'components/UI/FranceConnectButton';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import EmailForm from './EmailForm';
import SSOButtons from './SSOButtons';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

const EmailFlowStart = ({
  loading,
  setError,
  onSubmit,
  onSwitchToSSO,
}: Props) => {
  const { passwordLoginEnabled, ssoProviders } = useAuthConfig();
  const { formatMessage } = useIntl();

  return (
    <Box data-cy="email-flow-start">
      {ssoProviders.franceconnect && (
        <>
          <FranceConnectButton
            logoAlt={formatMessage(oldMessages.signUpButtonAltText, {
              loginMechanismName: 'FranceConnect',
            })}
            onClick={() => onSwitchToSSO('franceconnect')}
          />
          {passwordLoginEnabled && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {passwordLoginEnabled && (
        <EmailForm
          loading={loading}
          topText={messages.enterYourEmailAddress}
          setError={setError}
          onSubmit={onSubmit}
        />
      )}
      <SSOButtons onClickSSO={onSwitchToSSO} />
    </Box>
  );
};

export default EmailFlowStart;
