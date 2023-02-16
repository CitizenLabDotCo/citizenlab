import React from 'react';

// hooks
import useStepMachine from './useStepMachine';

// components
import SignUpAuthProviders from './steps/SignUpAuthProviders';
import SignInAuthProviders from './steps/SignInAuthProviders';
import EmailSignUp from './steps/EmailSignUp';

const Modal = () => {
  const { currentStep, send } = useStepMachine();

  return (
    <>
      {currentStep === 'inactive' && (
        <button onClick={() => send(currentStep, 'START_SIGN_UP_FLOW')}>
          Sign up
        </button>
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
        (currentStep === 'email-confirmation:submitting' && <></>)}

      {currentStep === 'success' && 'Success!'}
    </>
  );
};

export default Modal;
