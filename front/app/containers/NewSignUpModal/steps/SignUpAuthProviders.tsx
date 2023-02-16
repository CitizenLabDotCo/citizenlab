import React from 'react';

interface Props {
  onSelectEmailSignUp: () => void;
  onToggleFlow: () => void;
}

const SignUpAuthProviders = ({ onSelectEmailSignUp, onToggleFlow }: Props) => (
  <div>
    Sign up (auth providers)
    <button onClick={onSelectEmailSignUp}>Email sign up</button>
    <br />
    <button onClick={onToggleFlow}>Go to sign in</button>
  </div>
);

export default SignUpAuthProviders;
