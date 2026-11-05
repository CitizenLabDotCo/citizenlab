import React from 'react';

import { IdMethodData } from 'api/id_methods/types';

import VerificationMethodButton from 'components/UI/VerificationMethodButton';

interface Props {
  method: IdMethodData;
  last: boolean;
  onClick: (method: IdMethodData) => void;
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
