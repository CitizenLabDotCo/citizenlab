import React from 'react';

import T from 'components/T';
import VerificationMethodButton from 'components/UI/VerificationMethodButton';

import {
  IDLookupMethod,
  TVerificationMethod,
} from 'api/verification_methods/types';

interface Props {
  method: IDLookupMethod;
  onClick: (method: TVerificationMethod) => void;
  last: boolean;
}

const IdCardLookupButton = ({ method, last, onClick }: Props) => {
  const handleOnClick = () => {
    onClick(method);
  };

  return (
    <VerificationMethodButton
      id="e2e-id_card_lookup-button"
      onClick={handleOnClick}
      last={last}
    >
      <T value={method.attributes.method_name_multiloc} />
    </VerificationMethodButton>
  );
};

export default IdCardLookupButton;
