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
