import React from 'react';

import { IDLookupMethod, IdMethodData } from 'api/id_methods/types';

import VerificationMethodButton from 'components/UI/VerificationMethodButton';

interface Props {
  method: IDLookupMethod;
  onClick: (method: IdMethodData) => void;
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
      {method.attributes.ui_method_name}
    </VerificationMethodButton>
  );
};

export default IdCardLookupButton;
