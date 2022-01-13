import React, { useCallback } from 'react';

// typings
import { TVerificationMethod } from 'services/verificationMethods';

// components
import VerificationMethodButton from 'modules/commercial/verification/citizen/components/VerificationMethodButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  method: TVerificationMethod;
  onMethodSelected: () => void;
  last: boolean;
}

const GentRrnButton = ({ method, last, onMethodSelected }: Props) => {
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
      <FormattedMessage {...messages.verifyGentRrn} />
    </VerificationMethodButton>
  );
};

export default GentRrnButton;
