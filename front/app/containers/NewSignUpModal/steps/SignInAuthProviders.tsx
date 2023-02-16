import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

interface Props {
  onToggleFlow: () => void;
}

const SignInAuthProviders = ({ onToggleFlow }: Props) => (
  <Box>
    <Text>Sign in (auth providers)</Text>
    <Button width="auto" onClick={onToggleFlow}>
      Go to sign up
    </Button>
  </Box>
);

export default SignInAuthProviders;
