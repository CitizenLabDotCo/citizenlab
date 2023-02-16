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
  const { currentStep, send } = useStepMachine();

  return (
    <Box p="16px" border="1px solid grey">
      {currentStep === 'inactive' && (
        <Button
          width="auto"
          onClick={() => send(currentStep, 'START_SIGN_UP_FLOW')}
        >
          Sign up
        </Button>
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

      {currentStep === 'email-sign-up' ||
        (currentStep === 'email-sign-up:submitting' && (
          <EmailSignUp currentStep={currentStep} send={send} />
        ))}

      {currentStep === 'email-confirmation' ||
        (currentStep === 'email-confirmation:submitting' && (
          <EmailConfirmation currentStep={currentStep} send={send} />
        ))}

      {currentStep === 'success' && <Text>Success!</Text>}
    </Box>
  );
};

export default Modal;
