import React from 'react';

// hooks
import useSteps from './useSteps';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import EmailSignUp from './steps/EmailSignUp';
import EmailConfirmation from './steps/EmailConfirmation';
import Password from './steps/Password';
import Success from './steps/Success';

const Modal = () => {
  const { currentStep, status, error, transition } = useSteps();

  return (
    <Box p="16px" border="1px solid grey" w="400px" h="400px">
      {currentStep === 'closed' && (
        <>
          <Text>Click sign up to start flow</Text>
          <Button
            width="auto"
            onClick={transition(currentStep, 'TRIGGER_REGISTRATION_FLOW')}
          >
            Sign up
          </Button>
        </>
      )}

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
  );
};

export default Modal;
