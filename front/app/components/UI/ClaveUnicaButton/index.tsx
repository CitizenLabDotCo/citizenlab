import React from 'react';

import { TVerificationMethod } from 'api/verification_methods/types';

import { AUTH_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';
import { removeUrlLocale } from 'utils/removeUrlLocale';

import ClaveUnicaButton from './ClaveUnicaButton';

interface Props {
  method: TVerificationMethod;
  last: boolean;
  onClick: (method: TVerificationMethod) => void;
  message: string | JSX.Element;
  disabled?: boolean;
}

const ClaveUnicaButtonWrapper = ({
  method,
  onClick,
  message,
  disabled = false,
}: Props) => {
  const handleOnClick = () => {
    onClick(method);
    // Probably, it doesn't affect the functionality. The actual location change happens in
    // setHref of front/app/api/authentication/singleSignOn.ts
    // TODO: remove.
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/clave_unica?token=${jwt}&verification_pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  };

  return (
    <ClaveUnicaButton
      disabled={disabled}
      message={message}
      onClick={handleOnClick}
    />
  );
};

export default ClaveUnicaButtonWrapper;
