import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'utils/locale';
import { getJwt } from 'utils/auth/jwt';

// typings
import { TVerificationMethod } from 'api/verification_methods/types';

// components
import FranceConnectButton from 'components/UI/FranceConnectButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

interface Props {
  method: TVerificationMethod;
  onClick: (method: TVerificationMethod) => void;
}

const VerificationFranceConnectButton = ({
  method,
  intl: { formatMessage },
  onClick,
}: Props & WrappedComponentProps) => {
  const handleOnClick = () => {
    onClick(method);
    const jwt = getJwt();
    const pathname = removeUrlLocale(window.location.pathname);
    // See id_franceconnect/app/lib/id_franceconnect/franceconnect_omniauth.rb:9 for how it works.
    // Possibly, front/app/api/authentication/singleSignOn.ts#setHref could be used the next time we need to add more params.
    window.location.href = `${AUTH_PATH}/franceconnect?token=${jwt}&pathname=${pathname}&sso_verification=true`;
  };

  return (
    <div id="e2e-franceconnect-button">
      <FranceConnectButton
        onClick={handleOnClick}
        logoAlt={formatMessage(messages.verificationButtonAltText)}
      />
    </div>
  );
};

export default injectIntl(VerificationFranceConnectButton);
