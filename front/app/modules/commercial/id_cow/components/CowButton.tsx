import React from 'react';

// typings
import { TVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'components/UI/VerificationMethodButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  method: TVerificationMethod;
  onClick: (method: TVerificationMethod) => void;
  last: boolean;
}

const CowButton = ({ method, last, onClick }: Props) => {
  const handleOnClick = () => {
    onClick(method);
  };

  return (
    <VerificationMethodButton
      id="e2e-cow-button"
      onClick={handleOnClick}
      last={last}
    >
      <FormattedMessage {...messages.verifyCow} />
    </VerificationMethodButton>
  );
};

export default CowButton;
