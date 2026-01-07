import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import Error from 'components/UI/Error';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import ClaveUnicaExpandedAuthProviderButton from '../../_components/ClaveUnicaExpandedAuthProviderButton';
import SSOButtonsExceptFCAndCU from '../../_components/SSOButtonsExceptFCAndCU';

import messages from './messages';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const SSOButtonsExceptFC = ({ onClickSSO }: Props) => {
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
        <Box mt="20px">
          <Or />
        </Box>
      )}
      <Box>
        {ssoProviders.claveUnica && (
          <Box mb="18px">
            <ClaveUnicaExpandedAuthProviderButton
              showConsent={true}
              onSelectAuthProvider={() => onClickSSO('clave_unica')}
            />
          </Box>
        )}
        <SSOButtonsExceptFCAndCU onSelectAuthProvider={onClickSSO} />
      </Box>
    </>
  );
};

export default SSOButtonsExceptFC;
