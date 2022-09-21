import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';

// typings
import { TVerificationMethod } from 'services/verificationMethods';

// components
import FranceConnectButton from 'components/UI/FranceConnectButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  method: TVerificationMethod;
  onClick: (method: TVerificationMethod) => void;
}

const VerificationFranceConnectButton = ({
  method,
  intl: { formatMessage },
  onClick,
}: Props & InjectedIntlProps) => {
  const handleOnClick = () => {
    onClick(method);
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/franceconnect?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
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
