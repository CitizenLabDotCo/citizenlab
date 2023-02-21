import React from 'react';

// hooks
import useSteps from './useSteps';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import EmailSignUp from './steps/EmailSignUp';
import EmailConfirmation from './steps/EmailConfirmation';
import Password from './steps/Password';
import Success from './steps/Success';

interface Props extends ReturnType<typeof useSteps> {}

const AuthModal = ({ currentStep, status, error, transition }: Props) => {
  const closable =
    currentStep === 'email-registration' ||
    currentStep === 'email-confirmation' ||
    currentStep === 'enter-password';

  const showHeader = currentStep !== 'success';

  const handleClose = () => {
    if (!closable) return;
    transition(currentStep, 'CLOSE')();
  };

  return (
    <Modal
      opened={currentStep !== 'closed'}
      close={handleClose}
      hideCloseButton={!closable}
      header={showHeader ? <>Before you participate</> : undefined}
    >
      <Box p="16px" w="100%" h="400px">
        {currentStep === 'email-registration' && (
          <EmailSignUp
            status={status}
            error={error}
            onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
            onSwitchToSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
          />
        )}

        {currentStep === 'email-confirmation' && (
          <EmailConfirmation
            status={status}
            error={error}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
          />
        )}

        {currentStep === 'enter-password' && <Password />}

        {currentStep === 'success' && <Success />}
      </Box>
    </Modal>
  );
};

export default AuthModal;
