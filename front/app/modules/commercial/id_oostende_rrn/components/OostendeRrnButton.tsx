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

const OostendeRrnButton = ({ method, last, onClick }: Props) => {
  const handleOnClick = () => {
    onClick(method);
  };

  return (
    <VerificationMethodButton
      id="e2e-oostende_rrn-button"
      last={last}
      onClick={handleOnClick}
    >
      <FormattedMessage {...messages.verifyOostendeRrn} />
    </VerificationMethodButton>
  );
};

export default OostendeRrnButton;
