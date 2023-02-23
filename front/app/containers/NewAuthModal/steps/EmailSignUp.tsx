import React from 'react';
import { Box, Text, Error } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { Status, ErrorCode } from '../typings';
import { SSOProvider } from 'services/singleSignOn';

interface Props {
  status: Status;
  error: ErrorCode | null;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

const EmailSignUp = ({ status, error, onSubmit }: Props) => {
  const loading = status === 'pending';

  const handleSubmit = () => {
    onSubmit('TODO');
  };

  return (
    <Box>
      {error && <Error text={error} />}
      <Text>Email sign up</Text>
      <Button
        onClick={handleSubmit}
        width="auto"
        disabled={loading}
        processing={loading}
      >
        Submit email
      </Button>
    </Box>
  );
};

export default EmailSignUp;
