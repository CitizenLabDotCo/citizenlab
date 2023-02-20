import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { Status, Error } from '../stepService';

interface Props {
  status: Status;
  error?: Error;
  onConfirm: () => void;
}

const EmailConfirmation = ({ status, onConfirm }: Props) => {
  const loading = status === 'pending';
  return (
    <Box>
      <Text>Email confirmation</Text>
      <Button
        width="auto"
        disabled={loading}
        processing={loading}
        onClick={onConfirm}
      >
        Confirm email
      </Button>
    </Box>
  );
};

export default EmailConfirmation;
