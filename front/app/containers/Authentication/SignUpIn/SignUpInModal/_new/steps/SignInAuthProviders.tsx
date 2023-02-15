import React from 'react';

interface Props {
  onToggleFlow: () => void;
}

const SignInAuthProviders = ({ onToggleFlow }: Props) => (
  <div>
    Sign in (auth providers)
    <button onClick={onToggleFlow}>Go to sign up</button>
  </div>
);

export default SignInAuthProviders;
