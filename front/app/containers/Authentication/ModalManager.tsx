import React, { useEffect } from 'react';

import { useModalQueue } from 'containers/App/ModalQueue';

import SuccessActions from './SuccessActions';
import useSteps from './useSteps';

const AuthenticationModalManager = () => {
  const { currentStep } = useSteps();
  const { queueModal } = useModalQueue();

  useEffect(() => {
    if (currentStep !== 'closed') {
      queueModal('authentication');
    }
  }, [queueModal, currentStep]);

  // Not sure about SuccessActions and where it should be in a separate file.
  return <SuccessActions />;
};

export default AuthenticationModalManager;
