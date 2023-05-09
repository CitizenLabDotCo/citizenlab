import React from 'react';

// typings
import { TVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'components/UI/VerificationMethodButton';

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
      id="e2e-bogus-button"
      last={last}
      onClick={handleOnClick}
    >
      Bogus verification (testing)
    </VerificationMethodButton>
  );
};

export default BogusButton;
