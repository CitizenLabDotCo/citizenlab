import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';

// typings
import { TVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'components/UI/VerificationMethodButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
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
