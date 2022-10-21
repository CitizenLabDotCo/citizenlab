import React, { memo, useCallback, useEffect, useState } from 'react';

// components
import AuthProviders, { AuthProvider } from 'components/SignUpIn/AuthProviders';
import PasswordSignin from 'components/SignUpIn/SignIn/PasswordSignin';
import {
  StyledHeaderContainer,
  StyledHeaderTitle,
  StyledModalContentContainer,
} from 'components/SignUpIn/styles';
import Error from 'components/UI/Error';

// utils
import { handleOnSSOClick } from 'services/singleSignOn';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import tracks from 'components/SignUpIn/tracks';
import { trackEventByName } from 'utils/analytics';

// style
import styled from 'styled-components';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div``;

export type TSignInSteps = 'auth-providers' | 'password-signin';

export interface Props {
  metaData: ISignUpInMetaData;
  customHeader?: JSX.Element;
  onSignInCompleted: (userId: string) => void;
  onGoToSignUp: () => void;
  className?: string;
}

const SignIn = memo<Props>(
  ({ metaData, customHeader, onSignInCompleted, onGoToSignUp, className }) => {
    const [activeStep, setActiveStep] =
      useState<TSignInSteps>('auth-providers');

    useEffect(() => {
      trackEventByName(tracks.signInFlowEntered);

      return () => {
        trackEventByName(tracks.signInFlowExited);
      };
    }, []);

    const handleOnAuthProviderSelected = (
      selectedMethod: AuthProvider,
      setHrefFromModule?: () => void
    ) => {
      if (selectedMethod === 'email') {
        setActiveStep('password-signin');
      } else {
        handleOnSSOClick(selectedMethod, metaData, setHrefFromModule);
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
