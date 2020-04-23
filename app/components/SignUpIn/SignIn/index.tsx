import React, { memo, useCallback, useState } from 'react';

// components
import PasswordSignin from 'components/SignUpIn/SignIn/PasswordSignin';
import AuthProviders, { AuthProvider } from 'components/SignUpIn/AuthProviders';
import { StyledHeaderContainer, StyledHeaderTitle, StyledModalContent } from 'components/SignUpIn/styles';

// utils
import { handleOnSSOClick } from 'services/singleSignOn';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div``;

export type TSignInSteps = 'auth-providers' | 'password-signin';

export interface Props {
  inModal: boolean;
  metaData: ISignUpInMetaData;
  onSignInCompleted: (userId: string) => void;
  onGoToSignUp: () => void;
  className?: string;
}

const SignIn = memo<Props>(({ inModal, metaData, onSignInCompleted, onGoToSignUp, className }) => {

  const [activeStep, setActiveStep] = useState<TSignInSteps>('auth-providers');

  const handleOnAuthProviderSelected = useCallback((selectedMethod: AuthProvider) => {
    if (selectedMethod === 'email') {
      setActiveStep('password-signin');
    } else {
      handleOnSSOClick(selectedMethod, metaData);
    }
  }, []);

  const handleGoToSignUpFlow = useCallback(() => {
    onGoToSignUp();
  }, [onGoToSignUp]);

  const handleOnSignInCompleted = useCallback((userId: string) => {
    onSignInCompleted(userId);
  }, [onSignInCompleted]);

  const handleGoToLogInOptions = useCallback(() => {
    setActiveStep('auth-providers');
  }, []);

  return (
    <Container className={`e2e-sign-in-container ${className}`}>
      <StyledHeaderContainer inModal={inModal}>
        <StyledHeaderTitle inModal={inModal}>
          <FormattedMessage {...messages.logIn} />
        </StyledHeaderTitle>
      </StyledHeaderContainer>

      <StyledModalContent inModal={inModal}>
        {activeStep === 'auth-providers' &&
          <AuthProviders
            flow={metaData.flow}
            onAuthProviderSelected={handleOnAuthProviderSelected}
            goToOtherFlow={handleGoToSignUpFlow}
          />
        }

        {activeStep === 'password-signin' &&
          <PasswordSignin
            onSignInCompleted={handleOnSignInCompleted}
            onGoToLogInOptions={handleGoToLogInOptions}
            onGoToSignUp={onGoToSignUp}
          />
        }
      </StyledModalContent>
    </Container>
  );
});

export default SignIn;
