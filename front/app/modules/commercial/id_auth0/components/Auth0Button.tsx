import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';
import {
  TVerificationMethodName,
  IDAuth0Method,
} from 'services/verificationMethods';
// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

// i18n
import T from 'components/T';

interface Props {
  onClick: (methodName: TVerificationMethodName) => void;
  verificationMethod: IDAuth0Method;
}

const Auth0Button = ({ onClick, verificationMethod }: Props) => {
  const handleOnClick = () => {
    onClick('auth0');
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/auth0?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  };

  return (
    <VerificationMethodButton id="e2e-auth0-button" onClick={handleOnClick}>
      <T value={verificationMethod.attributes.method_name_multiloc} />
    </VerificationMethodButton>
  );
};

export default Auth0Button;
