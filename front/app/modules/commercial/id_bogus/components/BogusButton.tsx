import React, { useCallback } from 'react';

// typings
import { TVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

interface Props {
  method: TVerificationMethod;
  onMethodSelected: () => void;
  last: boolean;
}

const BogusButton = ({ method, last, onMethodSelected }: Props) => {
  const handleOnClick = useCallback(() => {
    onMethodSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
