import React from 'react';

import { TVerificationMethod } from 'api/verification_methods/types';

import { AUTH_PATH } from 'containers/App/constants';

import VerificationMethodButton from 'components/UI/VerificationMethodButton';

import { getJwt } from 'utils/auth/jwt';
import { FormattedMessage } from 'utils/cl-intl';
import { removeUrlLocale } from 'utils/removeUrlLocale';

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
    window.location.href = `${AUTH_PATH}/bosa_fas?token=${jwt}&verification_pathname=${removeUrlLocale(
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
