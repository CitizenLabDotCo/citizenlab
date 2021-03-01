import React, { memo, useCallback, useState, useEffect } from 'react';

// components
import PasswordSignin from 'components/SignUpIn/SignIn/PasswordSignin';
import AuthProviders, { AuthProvider } from 'components/SignUpIn/AuthProviders';
import Error from 'components/UI/Error';
import {
  StyledHeaderContainer,
  StyledHeaderTitle,
  StyledModalContentContainer,
} from 'components/SignUpIn/styles';

// utils
import { handleOnSSOClick } from 'services/singleSignOn';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/SignUpIn/tracks';

// style
import styled from 'styled-components';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div``;

export type TSignInSteps = 'auth-providers' | 'password-signin';

export interface Props {
  metaData: ISignUpInMetaData;
  windowHeight: number;
  customHeader?: JSX.Element;
  onSignInCompleted: (userId: string) => void;
  onGoToSignUp: () => void;
  className?: string;
}

const SignIn = memo<Props>(
  ({
    metaData,
    windowHeight,
    customHeader,
    onSignInCompleted,
    onGoToSignUp,
    className,
  }) => {
    const [activeStep, setActiveStep] = useState<TSignInSteps>(
      'auth-providers'
    );

    useEffect(() => {
      trackEventByName(tracks.signInFlowEntered);

      return () => {
        trackEventByName(tracks.signInFlowExited);
      };
    }, []);

    const handleOnAuthProviderSelected = useCallback(
      (selectedMethod: AuthProvider) => {
        if (selectedMethod === 'email') {
          setActiveStep('password-signin');
        } else {
          handleOnSSOClick(selectedMethod, metaData);
        }
      },
      []
    );

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
          inModal={!!metaData.inModal}
        >
          {!customHeader ? (
            <StyledHeaderTitle inModal={!!metaData.inModal}>
              <FormattedMessage {...messages.logIn} />
            </StyledHeaderTitle>
          ) : (
            customHeader
          )}
        </StyledHeaderContainer>

        <StyledModalContentContainer
          inModal={!!metaData.inModal}
          windowHeight={`${windowHeight}px`}
          headerHeight="68px"
          className="signupincontentcontainer"
        >
          {metaData.error ? (
            <Error
              text={<FormattedMessage {...messages.somethingWentWrongText} />}
              animate={false}
              marginBottom="30px"
            />
          ) : (
            <>
              {activeStep === 'auth-providers' && (
                <AuthProviders
                  metaData={metaData}
                  onAuthProviderSelected={handleOnAuthProviderSelected}
                  goToOtherFlow={handleGoToSignUpFlow}
                />
              )}

              {activeStep === 'password-signin' && (
                <PasswordSignin
                  metaData={metaData}
                  onSignInCompleted={handleOnSignInCompleted}
                  onGoToLogInOptions={handleGoToLogInOptions}
                  onGoToSignUp={onGoToSignUp}
                />
              )}
            </>
          )}
        </StyledModalContentContainer>
      </Container>
    );
  }
);

export default SignIn;
