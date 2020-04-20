import React, { memo, useCallback, useState } from 'react';

// components
import PasswordSignin from './PasswordSignin';
import AuthProviders, { AuthProvider } from '../AuthProviders';

// utils
import { handleOnSSOClick } from 'services/singleSignOn';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { HeaderContainer, HeaderTitle, ModalContent } from 'components/UI/Modal';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div``;

const StyledHeaderContainer = styled(HeaderContainer)<{ inModal: boolean }>`
  ${props => !props.inModal && `
    background: transparent;
    border: none;
  `}
`;

const StyledModalContent = styled(ModalContent)<{ inModal: boolean }>`
  padding-top: 20px;

  ${props => props.inModal && `
    max-height: calc(85vh - 150px);
  `}
`;

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
      handleOnSSOClick(selectedMethod, this.props.metaData);
    }
  }, []);

  const handleGoToSignUpFlow = useCallback(() => {
    onGoToSignUp();
  }, [onGoToSignUp]);

  const handleOnSignInCompleted = useCallback((userId: string) => {
    onSignInCompleted(userId);
  }, [onSignInCompleted]);

  return (
    <Container className={`e2e-sign-in-container ${className}`}>
      <StyledHeaderContainer inModal={inModal}>
        <HeaderTitle className={inModal ? 'inModal' : 'notInModal'}>
          <FormattedMessage {...messages.logIn} />
        </HeaderTitle>
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
          <PasswordSignin onSignInCompleted={handleOnSignInCompleted} />
        }
      </StyledModalContent>
    </Container>
  );
});

export default SignIn;
