import React from 'react';

// typings
import { TVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  method: TVerificationMethod;
  onClick: (method: TVerificationMethod) => void;
  last: boolean;
}

const GentRrnButton = ({ method, last, onClick }: Props) => {
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
      <FormattedMessage {...messages.verifyGentRrn} />
    </VerificationMethodButton>
  );
};

export default GentRrnButton;
