import React, { useCallback } from 'react';

// typings
import { IVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'components/Verification/VerificationMethodButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  method: IVerificationMethod;
  onMethodSelected: () => void;
  last: boolean;
}

const CowButton = ({ method, last, onMethodSelected }: Props) => {
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
      <FormattedMessage {...messages.verifyCow} />
    </VerificationMethodButton>
  );
};

export default CowButton;
