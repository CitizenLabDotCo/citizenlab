import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';
import { isNilOrError } from 'utils/helperUtils';
import { TVerificationMethodName } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

// i18n
import T from 'components/T';
import useVerificationMethod from 'hooks/useVerificationMethod';

interface Props {
  onClick: (methodName: TVerificationMethodName) => void;
}

const Auth0Button = ({ onClick }: Props) => {
  const verificationMethod = useVerificationMethod('auth0');
  const handleOnClick = () => {
    onClick('auth0');
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/auth0?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  };

  if (!isNilOrError(verificationMethod)) {
    return (
      <VerificationMethodButton
        id="e2e-auth0-button"
        className={last ? 'last' : ''}
        onClick={handleOnClick}
      >
        <T value={verificationMethod.attributes.method_name_multiloc} />
      </VerificationMethodButton>
    );
  }

  return null;
};

export default Auth0Button;
