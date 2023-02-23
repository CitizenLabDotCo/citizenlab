import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { Status, ErrorCode } from '../typings';

interface Props {
  status: Status;
  error: ErrorCode | null;
  onConfirm: (code: number) => void;
}

const EmailConfirmation = ({ status, onConfirm }: Props) => {
  const loading = status === 'pending';
  const handleConfirm = () => {
    onConfirm(1234); // TODO
  };

  return (
    <Box>
      <Text mt="0px">Email confirmation</Text>
      <Button
        width="auto"
        disabled={loading}
        processing={loading}
        onClick={handleConfirm}
      >
        Confirm email
      </Button>
    </Box>
  );
};

export default EmailConfirmation;
