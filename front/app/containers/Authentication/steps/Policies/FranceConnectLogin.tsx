import React from 'react';

// i18n
import { useIntl } from 'utils/cl-intl';
import oldMessages from 'containers/Authentication/steps/AuthProviders/messages';

// components
import FranceConnectButton from 'components/UI/FranceConnectButton';

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
