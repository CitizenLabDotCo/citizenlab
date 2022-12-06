import React, { memo, useCallback, useState, useEffect } from 'react';
// style
import styled from 'styled-components';
// utils
import { handleOnSSOClick } from 'services/singleSignOn';
// typings
import { ISignUpInMetaData } from 'events/openSignUpInModal';
// analytics
import { trackEventByName } from 'utils/analytics';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import AuthProviders, { AuthProvider } from 'components/AuthProviders';
import Error from 'components/UI/Error';
import {
  StyledHeaderContainer,
  StyledHeaderTitle,
  StyledModalContentContainer,
} from '../styles';
import tracks from '../tracks';
// components
import PasswordSignin from './PasswordSignin';
import messages from './messages';

const Container = styled.div``;

export type TSignInSteps = 'auth-providers' | 'password-signin';

export interface Props {
  metaData: ISignUpInMetaData;
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
          </>
        </StyledModalContentContainer>
      </Container>
    );
  }
);

export default SignIn;
