import React, { useCallback } from 'react';

// typings
import { IVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'components/Verification/VerificationMethodButton';

interface Props {
  method: IVerificationMethod;
  onMethodSelected: () => void;
  last: boolean;
}

const BogusButton = ({ method, last, onMethodSelected }: Props) => {
  const handleOnClick = useCallback(() => {
    onMethodSelected();
  }, []);

  return (
    <VerificationMethodButton
      key={method.id}
      id={`e2e-${method.attributes.name}-button`}
      className={last ? 'last' : ''}
      onClick={handleOnClick}
    >
      Bogus verification (testing)
    </VerificationMethodButton>
  );
};

export default BogusButton;
