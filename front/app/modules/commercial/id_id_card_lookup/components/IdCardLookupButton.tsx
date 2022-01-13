import React, { useCallback } from 'react';

// typings
import { IDLookupMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

// i18n
import T from 'components/T';

interface Props {
  method: IDLookupMethod;
  onMethodSelected: () => void;
  last: boolean;
}

const IdCardLookupButton = ({ method, last, onMethodSelected }: Props) => {
  const handleOnClick = useCallback(() => {
    onMethodSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <VerificationMethodButton
      key={method.id}
      id="e2e-id_card_lookup-button"
      className={last ? 'last' : ''}
      onClick={handleOnClick}
    >
      <T value={method.attributes.method_name_multiloc} />
    </VerificationMethodButton>
  );
};

export default IdCardLookupButton;
