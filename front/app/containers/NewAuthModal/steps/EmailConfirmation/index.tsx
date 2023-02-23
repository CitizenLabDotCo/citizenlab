import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import CodeSentMessage from 'containers/Authentication/SignUpIn/SignUpInModal/SignUp/ConfirmationSignupStep/CodeSentMessage';

// typings
import { Status, ErrorCode } from '../../typings';

interface Props {
  status: Status;
  error: ErrorCode | null;
  onConfirm: (code: string) => void;
}

const EmailConfirmation = ({ status, onConfirm }: Props) => {
  const loading = status === 'pending';
  const handleConfirm = () => {
    onConfirm('1234'); // TODO
  };

  return (
    <Box>
      <CodeSentMessage />
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
