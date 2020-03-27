import React, { memo, useCallback, useState } from 'react';

// components
import PasswordSignin from './PasswordSignin';
import MethodSelection, { TSignUpInMethods } from '../MethodSelection';

// utils
import { handleOnSSOClick } from 'services/singleSignOn';

// style
import styled from 'styled-components';

const Container = styled.div``;

export type TSignInSteps = 'method-selection' | 'password-signin';

interface Props {
  onSignInCompleted: (userId: string) => void;
  className?: string;
}

const SignIn = memo<Props>(({ onSignInCompleted, className }) => {

  const [activeStep, setActiveStep] = useState<TSignInSteps>('method-selection');

  const handleOnMethodSelected = useCallback((selectedMethod: TSignUpInMethods) => {
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
      {activeStep === 'method-selection' &&
        <MethodSelection onMethodSelected={handleOnMethodSelected} />
      }

      {activeStep === 'password-signin' &&
        <PasswordSignin onSignInCompleted={handleOnSignInCompleted} />
      }
    </Container>
  );
});

export default SignIn;
