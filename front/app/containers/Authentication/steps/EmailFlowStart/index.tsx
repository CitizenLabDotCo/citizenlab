import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';

import oldMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';
import { SetError } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import FranceConnectButton from 'components/UI/FranceConnectButton';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import EmailForm from './EmailForm';
import SSOButtons from './SSOButtons';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
  onEnterFranceConnect: () => void;
}

const EmailFlowStart = ({
  loading,
  setError,
  onSubmit,
  onSwitchToSSO,
  onEnterFranceConnect,
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
            onClick={onEnterFranceConnect}
          />
          {passwordLoginEnabled && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {passwordLoginEnabled && (
        <EmailForm loading={loading} setError={setError} onSubmit={onSubmit} />
      )}
      <SSOButtons onClickSSO={onSwitchToSSO} />
    </Box>
  );
};

export default EmailFlowStart;
