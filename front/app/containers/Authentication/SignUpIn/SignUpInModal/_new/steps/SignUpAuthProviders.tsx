import React from 'react';

interface Props {
  onToggleFlow: () => void;
}

const SignUpAuthProviders = ({ onToggleFlow }: Props) => (
  <div>
    Sign up (auth providers)
    <button onClick={onToggleFlow}>Go to sign in</button>
  </div>
);

export default SignUpAuthProviders;
