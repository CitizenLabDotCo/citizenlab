import React from 'react';

import { SSOProvider } from 'api/authentication/singleSignOn';

import oldMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import FranceConnectButton from 'components/UI/FranceConnectButton';

import { useIntl } from 'utils/cl-intl';

import useAuthMethodNames from './SSOButtonsExceptFC/methodNames';

interface Props {
  onClick: (ssoProvider: SSOProvider) => void;
}

// FranceConnect is a verification-capable method with its own branded button.
const FranceConnectBlock = ({ onClick }: Props) => {
  const { formatMessage } = useIntl();
  const names = useAuthMethodNames();

  return (
    <FranceConnectButton
      logoAlt={formatMessage(oldMessages.signUpButtonAltText, {
        loginMechanismName: names.franceconnect,
      })}
      onClick={() => onClick('franceconnect')}
    />
  );
};

export default FranceConnectBlock;
