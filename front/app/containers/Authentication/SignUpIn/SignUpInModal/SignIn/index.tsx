import React, { memo, useCallback, useState, useEffect } from 'react';

// components
import PasswordSignin from './PasswordSignin';
import AuthProviders, {
  AuthProvider,
} from 'containers/NewAuthModal/steps/AuthProviders';
import Error from 'components/UI/Error';
import {
  StyledHeaderContainer,
  StyledHeaderTitle,
  StyledModalContentContainer,
} from '../styles';

// utils
import { handleOnSSOClick } from 'services/singleSignOn';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// style
import styled from 'styled-components';

// typings
import { AuthenticationData } from 'containers/NewAuthModal/typings';

const Container = styled.div``;

export type TSignInSteps = 'auth-providers' | 'password-signin';

export interface Props {
  metaData: AuthenticationData;
  onSignInCompleted: (userId: string) => void;
  onGoToSignUp: () => void;
  className?: string;
  fullScreen?: boolean;
}

const SignIn = memo<Props>(
  ({ metaData, onSignInCompleted, onGoToSignUp, className, fullScreen }) => {
    const [activeStep, setActiveStep] =
      useState<TSignInSteps>('auth-providers');

    useEffect(() => {
      trackEventByName(tracks.signInFlowEntered);

      return () => {
        trackEventByName(tracks.signInFlowExited);
      };
    }, []);

    const handleOnAuthProviderSelected = (selectedMethod: AuthProvider) => {
      if (selectedMethod === 'email') {
        setActiveStep('password-signin');
      } else {
        handleOnSSOClick(selectedMethod, metaData, false);
      }
    };

    const handleGoToSignUpFlow = useCallback(() => {
      onGoToSignUp();
    }, [onGoToSignUp]);

    const handleOnSignInCompleted = useCallback(
      (userId: string) => {
        trackEventByName(tracks.signInFlowCompleted);
        onSignInCompleted(userId);
      },
      [onSignInCompleted]
    );

    const handleGoToLogInOptions = useCallback(() => {
      setActiveStep('auth-providers');
    }, []);

    return (
      <Container id="e2e-sign-in-container" className={className}>
        <StyledHeaderContainer
          className="signupinheadercontainer"
          inModal={true}
        >
          <StyledHeaderTitle inModal={true}>
            <FormattedMessage {...messages.logIn} />
          </StyledHeaderTitle>
        </StyledHeaderContainer>

        <StyledModalContentContainer
          inModal={true}
          fullScreen={fullScreen}
          headerHeight="68px"
          className="signupincontentcontainer"
        >
          <>
            {metaData.error?.code === 'general' ? (
              <Error
                text={<FormattedMessage {...messages.somethingWentWrongText} />}
                animate={false}
                marginBottom="30px"
              />
            ) : (
              <>
                {activeStep === 'auth-providers' && (
                  <AuthProviders
                    flow={metaData.flow}
                    onSelectAuthProvider={handleOnAuthProviderSelected}
                    onSwitchFlow={handleGoToSignUpFlow}
                  />
                )}

                {activeStep === 'password-signin' && (
                  <PasswordSignin
                    onSignInCompleted={handleOnSignInCompleted}
                    onGoToLogInOptions={handleGoToLogInOptions}
                    onGoToSignUp={onGoToSignUp}
                  />
                )}
              </>
            )}
          </>
        </StyledModalContentContainer>
      </Container>
    );
  }
);

export default SignIn;
