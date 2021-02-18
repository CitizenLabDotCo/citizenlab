import React, { useCallback } from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';

// typings
import { IVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'components/Verification/VerificationMethodButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  activeMethods: IVerificationMethod[];
}

const BosaFasButton = ({ activeMethods }: Props) => {
  const method = activeMethods.find((m) => m.attributes.name === 'bosa_fas');

  if (!method) return null;
  const index = activeMethods.findIndex(
    (m) => m.attributes.name === 'bosa_fas'
  );

  const handleOnClick = useCallback(() => {
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/bosa_fas?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  }, []);

  return (
    <VerificationMethodButton
      key={method.id}
      id={`e2e-${method.attributes.name}-button`}
      className={index + 1 === activeMethods.length ? 'last' : ''}
      onClick={handleOnClick}
    >
      <FormattedMessage {...messages.verifyBOSA} />
    </VerificationMethodButton>
  );
};

export default BosaFasButton;
