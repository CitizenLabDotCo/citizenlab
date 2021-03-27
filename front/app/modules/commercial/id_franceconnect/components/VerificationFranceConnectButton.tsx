import React, { useCallback } from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';

// typings
import { IVerificationMethod } from 'services/verificationMethods';

// components
import FranceConnectButton from 'components/UI/FranceConnectButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  method: IVerificationMethod;
  last: boolean;
}

const VerificationFranceConnectButton = ({
  method,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleOnClick = useCallback(() => {
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/franceconnect?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  }, []);

  return (
    <div key={method.id} id={`e2e-${method.attributes.name}-button`}>
      <FranceConnectButton
        onClick={handleOnClick}
        logoAlt={formatMessage(messages.verificationButtonAltText)}
      />
    </div>
  );
};

export default injectIntl(VerificationFranceConnectButton);
