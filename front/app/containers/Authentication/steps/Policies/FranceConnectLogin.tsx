import React from 'react';

import oldMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import FranceConnectButton from 'components/UI/FranceConnectButton';

import { useIntl } from 'utils/cl-intl';

interface Props {
  onLogin: () => void;
}

const FranceConnectLogin = ({ onLogin }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <FranceConnectButton
      logoAlt={formatMessage(oldMessages.signUpButtonAltText, {
        loginMechanismName: 'FranceConnect',
      })}
      onClick={onLogin}
    />
  );
};

export default FranceConnectLogin;
