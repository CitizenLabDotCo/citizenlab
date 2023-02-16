import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { Send } from '../stepService';

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
    <Box>
      <Text>Email sign up</Text>
      <Button
        onClick={handleClickSubmit}
        width="auto"
        disabled={currentStep === 'email-sign-up:submitting'}
        processing={currentStep === 'email-sign-up:submitting'}
      >
        Submit email
      </Button>
    </Box>
  );
};

export default EmailSignUp;
