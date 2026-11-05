import React from 'react';

import { AUTH_PATH } from 'containers/App/constants';

import ClaveUnicaButton from 'components/UI/ClaveUnicaButton';
import messages from 'components/UI/ClaveUnicaButton/messages';

import { getJwt } from 'utils/auth/jwt';
import { FormattedMessage } from 'utils/cl-intl';
import { removeUrlLocale } from 'utils/removeUrlLocale';

const ClaveUnicaVerificationButton = () => {
  const handleOnClick = () => {
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/clave_unica?token=${jwt}&verification_pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  };

  return (
    <ClaveUnicaButton
      message={<FormattedMessage {...messages.verifyClaveUnica} />}
      onClick={handleOnClick}
    />
  );
};

export default ClaveUnicaVerificationButton;
