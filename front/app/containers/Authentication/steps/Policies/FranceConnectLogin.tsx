import React, { lazy, Suspense } from 'react';

import oldMessages from 'containers/Authentication/steps/AuthProviders/messages';

import { useIntl } from 'utils/cl-intl';

const FranceConnectButton = lazy(
  () => import('components/UI/FranceConnectButton')
);

interface Props {
  onLogin: () => void;
}

const FranceConnectLogin = ({ onLogin }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Suspense fallback={null}>
      <FranceConnectButton
        logoAlt={formatMessage(oldMessages.signUpButtonAltText, {
          loginMechanismName: 'FranceConnect',
        })}
        onClick={onLogin}
      />
    </Suspense>
  );
};

export default FranceConnectLogin;
