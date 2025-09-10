import React from 'react';

import { AUTH_PATH } from 'containers/App/constants';

import ClaveUnicaButton from 'components/UI/ClaveUnicaButton';

import { getJwt } from 'utils/auth/jwt';
import { removeUrlLocale } from 'utils/removeUrlLocale';

interface Props {
  message: string | JSX.Element;
  disabled?: boolean;
}

const ClaveUnicaButtonWrapper = ({ message, disabled = false }: Props) => {
  const handleOnClick = () => {
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
