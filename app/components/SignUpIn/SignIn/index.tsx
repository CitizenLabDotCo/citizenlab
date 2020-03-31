import React, { memo, useCallback, useState } from 'react';

// components
import PasswordSignin from './PasswordSignin';
import AuthProviders, { AuthProvider } from '../AuthProviders';

// utils
import { handleOnSSOClick } from 'services/singleSignOn';

// style
import styled from 'styled-components';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div``;

export type TSignInSteps = 'auth-providers' | 'password-signin';

export interface Props {
  metaData: ISignUpInMetaData;
  onSignInCompleted: (userId: string) => void;
  className?: string;
}

const SignIn = memo<Props>(({ metaData, onSignInCompleted, className }) => {

  const [activeStep, setActiveStep] = useState<TSignInSteps>('auth-providers');

  const handleOnAuthProviderSelected = useCallback((selectedMethod: AuthProvider) => {
    if (selectedMethod === 'email') {
      setActiveStep('password-signin');
    } else {
      handleOnSSOClick(selectedMethod, this.props.metaData);
    }
  }, []);

  const handleOnSignInCompleted = useCallback((userId: string) => {
    onSignInCompleted(userId);
  }, [onSignInCompleted]);

  return (
    <Container className={`e2e-sign-in-container ${className}`}>
      {activeStep === 'auth-providers' &&
        <AuthProviders
          flow={metaData.flow}
          onAuthProviderSelected={handleOnAuthProviderSelected}
        />
      }

      {activeStep === 'password-signin' &&
        <PasswordSignin onSignInCompleted={handleOnSignInCompleted} />
      }
    </Container>
  );
});

export default SignIn;
