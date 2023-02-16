import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

interface Props {
  onSelectEmailSignUp: () => void;
  onToggleFlow: () => void;
}

const SignUpAuthProviders = ({ onSelectEmailSignUp, onToggleFlow }: Props) => (
  <Box>
    <Text>Sign up (auth providers)</Text>
    <Button width="auto" onClick={onSelectEmailSignUp}>
      Email sign up
    </Button>
    <Button width="auto" onClick={onToggleFlow} mt="12px">
      Go to sign in
    </Button>
  </Box>
);

export default SignUpAuthProviders;
