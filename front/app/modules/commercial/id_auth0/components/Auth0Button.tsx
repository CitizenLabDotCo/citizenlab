import React, { useCallback } from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';

// typings
import { IDAuth0Method } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

// i18n
import T from 'components/T';

interface Props {
  method: IDAuth0Method;
  last: boolean;
}

const Auth0Button = ({ method, last }: Props) => {
  const handleOnClick = useCallback(() => {
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/auth0?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  }, []);

  return (
    <VerificationMethodButton
      key={method.id}
      id="e2e-auth0-button"
      className={last ? 'last' : ''}
      onClick={handleOnClick}
    >
      <T value={method.attributes.method_name_multiloc} />
    </VerificationMethodButton>
  );
};

export default Auth0Button;
