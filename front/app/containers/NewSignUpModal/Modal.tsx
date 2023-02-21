import React from 'react';

// hooks
import useStepMachine from './useStepMachine';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import EmailSignUp from './steps/EmailSignUp';
import EmailConfirmation from './steps/EmailConfirmation';

const Modal = () => {
  const { currentStep, state, send } = useStepMachine();

  return (
    <Box p="16px" border="1px solid grey" w="400px" h="400px">
      {currentStep === 'inactive' && (
        <>
          <Text>Click sign up to start flow</Text>
          <Button
            width="auto"
            onClick={() => send(currentStep, 'START_SIGN_UP_FLOW')}
          >
            Sign up
          </Button>
        </>
      )}

      {currentStep === 'email-sign-up' && (
        <EmailSignUp
          {...state}
          onGoBack={() => send(currentStep, 'GO_BACK')}
          onSubmit={() => send(currentStep, 'SUBMIT_EMAIL')}
        />
      )}

      {currentStep === 'email-confirmation' && (
        <EmailConfirmation
          {...state}
          onConfirm={() => send(currentStep, 'CONFIRM_EMAIL')}
        />
      )}

      {currentStep === 'success' && (
        <Box>
          <Text>Success!</Text>
          <Button width="auto" onClick={() => send(currentStep, 'EXIT')}>
            Exit
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Modal;
