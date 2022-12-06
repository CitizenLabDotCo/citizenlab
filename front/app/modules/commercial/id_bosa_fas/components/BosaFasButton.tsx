import React from 'react';
import { removeUrlLocale } from 'services/locale';
// typings
import { TVerificationMethod } from 'services/verificationMethods';
import { getJwt } from 'utils/auth/jwt';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { AUTH_PATH } from 'containers/App/constants';
// components
import VerificationMethodButton from 'containers/Authentication/VerificationModal/VerificationMethodButton';
import messages from '../messages';

interface Props {
  method: TVerificationMethod;
  last: boolean;
  onClick: (method: TVerificationMethod) => void;
}

const BosaFasButton = ({ method, last, onClick }: Props) => {
  const handleOnClick = () => {
    onClick(method);

    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/bosa_fas?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  };

  return (
    <VerificationMethodButton
      id="e2e-bosa_fas-button"
      last={last}
      onClick={handleOnClick}
    >
      <FormattedMessage {...messages.verifyBOSA} />
    </VerificationMethodButton>
  );
};

export default BosaFasButton;
