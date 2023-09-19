import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';

// typings
import { TVerificationMethod } from 'api/verification_methods/types';

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

const NemlogInButton = ({ method, last, onClick }: Props) => {
  const handleOnClick = () => {
    onClick(method);

    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/nemlog_in?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  };

  return (
    <VerificationMethodButton last={last} onClick={handleOnClick}>
      <FormattedMessage {...messages.verifyNemLogIn} />
    </VerificationMethodButton>
  );
};

export default NemlogInButton;
