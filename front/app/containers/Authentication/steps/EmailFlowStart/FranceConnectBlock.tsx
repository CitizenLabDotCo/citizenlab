import React from 'react';

import { SSOProvider } from 'api/authentication/singleSignOn';

import useIdMethodNames from 'hooks/useIdMethodNames';

import oldMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import FranceConnectButton from 'components/UI/FranceConnectButton';

import { useIntl } from 'utils/cl-intl';

interface Props {
  onClick: (ssoProvider: SSOProvider) => void;
}

// FranceConnect is a verification-capable method with its own branded button.
const FranceConnectBlock = ({ onClick }: Props) => {
  const { formatMessage } = useIntl();
  const idMethodNames = useIdMethodNames();

  return (
    <FranceConnectButton
      logoAlt={formatMessage(oldMessages.signUpButtonAltText, {
        loginMechanismName: idMethodNames.franceconnect,
      })}
      onClick={() => onClick('franceconnect')}
    />
  );
};

export default FranceConnectBlock;
