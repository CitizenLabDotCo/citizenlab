import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { Send } from '../useStepMachine';

interface Props {
  currentStep: 'email-confirmation' | 'email-confirmation:submitting';
  send: Send;
}

const EmailConfirmation = ({ currentStep, send }: Props) => {
  const handleConfirmEmail = () => {
    if (currentStep !== 'email-confirmation:submitting') {
      send('email-confirmation', 'CONFIRM_EMAIL');
    }
  };

  return (
    <Box>
      <Text>Email confirmation</Text>
      <Button
        width="auto"
        disabled={currentStep === 'email-confirmation:submitting'}
        onClick={handleConfirmEmail}
      >
        Confirm email
      </Button>
    </Box>
  );
};

export default EmailConfirmation;
