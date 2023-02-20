import React from 'react';
import { Box, Text, Error } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { Status, Error as ErrorType } from '../stepService';

interface Props {
  status: Status;
  error?: ErrorType;
  onSubmit: () => void;
  onGoBack: () => void;
}

const EmailSignUp = ({ status, error, onSubmit, onGoBack }: Props) => {
  const loading = status === 'pending';

  return (
    <Box>
      {error && <Error text={error} />}
      <Text>Email sign up</Text>
      <Button
        onClick={onSubmit}
        width="auto"
        disabled={loading}
        processing={loading}
      >
        Submit email
      </Button>
      <Button
        mt="12px"
        width="auto"
        buttonStyle="secondary"
        onClick={onGoBack}
        disabled={loading}
        processing={loading}
      >
        Go back
      </Button>
    </Box>
  );
};

export default EmailSignUp;
