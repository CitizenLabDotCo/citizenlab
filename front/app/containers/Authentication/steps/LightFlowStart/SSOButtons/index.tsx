import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import Error from 'components/UI/Error';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import SSOButtonsExceptFC from '../../_components/SSOButtonsExceptFC';

import FranceConnectButton from './FranceConnectButton';
import messages from './messages';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const SSOButtons = ({ onClickSSO }: Props) => {
  const { formatMessage } = useIntl();
  const { passwordLoginEnabled, ssoProviders, anySSOProviderEnabled } =
    useAuthConfig();

  if (!anySSOProviderEnabled) {
    if (passwordLoginEnabled) {
      return null;
    }

    // This should never actually happen
    return (
      <Error text={formatMessage(messages.noAuthenticationMethodsEnabled)} />
    );
  }

  return (
    <>
      {passwordLoginEnabled && (
        <Box mt="32px" mb="20px">
          <Or />
        </Box>
      )}
      <Box>
        {ssoProviders.franceconnect && (
          <FranceConnectButton onClick={() => onClickSSO('franceconnect')} />
        )}
        <SSOButtonsExceptFC
          showConsent={false}
          flow="signin"
          onSelectAuthProvider={onClickSSO}
        />
      </Box>
    </>
  );
};

export default SSOButtons;
