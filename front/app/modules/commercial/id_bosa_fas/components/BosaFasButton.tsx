import React, { useCallback } from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';

// typings
import { TVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  method: TVerificationMethod;
  last: boolean;
}

const BosaFasButton = ({ method, last }: Props) => {
  const handleOnClick = useCallback(() => {
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/bosa_fas?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  }, []);

  return (
    <VerificationMethodButton
      key={method.id}
      id={`e2e-${method.attributes.name}-button`}
      className={last ? 'last' : ''}
      onClick={handleOnClick}
    >
      <FormattedMessage {...messages.verifyBOSA} />
    </VerificationMethodButton>
  );
};

export default BosaFasButton;
