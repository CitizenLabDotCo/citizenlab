import React from 'react';

import {
  TVerificationMethod,
  IDIdAustriaMethod,
} from 'api/verification_methods/types';

import { AUTH_PATH } from 'containers/App/constants';

import VerificationMethodButton from 'components/UI/VerificationMethodButton';

import { getJwt } from 'utils/auth/jwt';
import { removeUrlLocale } from 'utils/removeUrlLocale';

interface Props {
  onClick: (method: TVerificationMethod) => void;
  verificationMethod: IDIdAustriaMethod;
  last: boolean;
}

const IdAustriaButton = ({ onClick, verificationMethod, last }: Props) => {
  const handleOnClick = () => {
    onClick(verificationMethod);
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/id_austria?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  };

  return (
    <VerificationMethodButton
      id="e2e-id_austria-button"
      onClick={handleOnClick}
      last={last}
    >
      {verificationMethod.attributes.ui_method_name}
    </VerificationMethodButton>
  );
};

export default IdAustriaButton;
