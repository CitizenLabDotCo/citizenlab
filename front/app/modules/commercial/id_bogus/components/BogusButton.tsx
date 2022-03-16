import React from 'react';

// typings
import { TVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

interface Props {
  method: TVerificationMethod;
  last: boolean;
  onClick: (method: TVerificationMethod) => void;
}

const BogusButton = ({ method, last, onClick }: Props) => {
  const handleOnClick = () => {
    onClick(method);
  };

  return (
    <VerificationMethodButton
      key={method.id}
      id={`e2e-${method.attributes.name}-button`}
      last={last}
      onClick={handleOnClick}
    >
      Bogus verification (testing)
    </VerificationMethodButton>
  );
};

export default BogusButton;
