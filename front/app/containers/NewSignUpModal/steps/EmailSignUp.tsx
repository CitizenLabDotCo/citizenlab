import React from 'react';
import { Send } from '../useStepMachine';

interface Props {
  currentStep: 'email-sign-up' | 'email-sign-up:submitting';
  send: Send;
}

const EmailSignUp = ({ currentStep, send }: Props) => {
  const handleClickSubmit = () => {
    if (currentStep === 'email-sign-up') {
      send(currentStep, 'SUBMIT_EMAIL');
    }
  };

  return (
    <div>
      Email sign up
      <button
        onClick={handleClickSubmit}
        disabled={currentStep === 'email-sign-up:submitting'}
      >
        Submit email
      </button>
    </div>
  );
};

export default EmailSignUp;
