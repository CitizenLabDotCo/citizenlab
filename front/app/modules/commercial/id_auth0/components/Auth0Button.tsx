import { AUTH_PATH } from 'containers/App/constants';
import React from 'react';
import { removeUrlLocale } from 'services/locale';
import {
  IDAuth0Method,
  TVerificationMethod,
} from 'services/verificationMethods';
import { getJwt } from 'utils/auth/jwt';
// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

// i18n
import T from 'components/T';

interface Props {
  onClick: (method: TVerificationMethod) => void;
  verificationMethod: IDAuth0Method;
  last: boolean;
}

const Auth0Button = ({ onClick, verificationMethod, last }: Props) => {
  const handleOnClick = () => {
    onClick(verificationMethod);
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/auth0?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  };

  return (
    <VerificationMethodButton
      id="e2e-auth0-button"
      onClick={handleOnClick}
      last={last}
    >
      <T value={verificationMethod.attributes.method_name_multiloc} />
    </VerificationMethodButton>
  );
};

export default Auth0Button;
