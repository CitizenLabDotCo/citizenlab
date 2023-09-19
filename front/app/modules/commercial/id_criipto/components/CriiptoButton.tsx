import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';
import {
  TVerificationMethod,
  IDCriiptoMethod,
} from 'api/verification_methods/types';
// components
import VerificationMethodButton from 'components/UI/VerificationMethodButton';

// i18n
import T from 'components/T';

interface Props {
  onClick: (method: TVerificationMethod) => void;
  verificationMethod: IDCriiptoMethod;
  last: boolean;
}

const CriiptoButton = ({ onClick, verificationMethod, last }: Props) => {
  const handleOnClick = () => {
    onClick(verificationMethod);
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/criipto?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  };

  return (
    <VerificationMethodButton
      id="e2e-criipto-button"
      onClick={handleOnClick}
      last={last}
    >
      <T value={verificationMethod.attributes.method_name_multiloc} />
    </VerificationMethodButton>
  );
};

export default CriiptoButton;
