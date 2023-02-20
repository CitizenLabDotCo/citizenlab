import React from 'react';

// hooks
import useStepMachine from './useStepMachine';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import SignUpAuthProviders from './steps/SignUpAuthProviders';
import SignInAuthProviders from './steps/SignInAuthProviders';
import EmailSignUp from './steps/EmailSignUp';
import EmailConfirmation from './steps/EmailConfirmation';

const Modal = () => {
  const { currentStep, state, send } = useStepMachine();

  return (
    <Box p="16px" border="1px solid grey" w="400px" h="400px">
      {currentStep === 'inactive' && (
        <>
          <Text>Click sign up or sign in to start flow</Text>
          <Button
            width="auto"
            onClick={() => send(currentStep, 'START_SIGN_UP_FLOW')}
          >
            Sign up
          </Button>

          <Button
            mt="12px"
            width="auto"
            onClick={() => send(currentStep, 'START_SIGN_IN_FLOW')}
          >
            Sign in
          </Button>
        </>
      )}

      {currentStep === 'sign-up-auth-providers' && (
        <SignUpAuthProviders
          onSelectEmailSignUp={() => send(currentStep, 'ENTER_EMAIL_SIGN_UP')}
          onToggleFlow={() => send(currentStep, 'TOGGLE_FLOW')}
        />
      )}

      {currentStep === 'sign-in-auth-providers' && (
        <SignInAuthProviders
          onToggleFlow={() => send(currentStep, 'TOGGLE_FLOW')}
        />
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
