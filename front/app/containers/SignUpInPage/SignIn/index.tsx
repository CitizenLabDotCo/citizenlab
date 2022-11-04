import React, { memo, useCallback, useState, useEffect } from 'react';

// components
import PasswordSignin from '../SignIn/PasswordSignin';
import AuthProviders, { AuthProvider } from '../AuthProviders';
import Error from 'components/UI/Error';
import { StyledHeaderContainer, StyledHeaderTitle } from '../styles';
import { Box } from '@citizenlab/cl2-component-library';

// utils
import { handleOnSSOClick } from 'services/singleSignOn';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// typings
import { ISignUpInMetaData } from '../SignUpIn';

export type TSignInSteps = 'auth-providers' | 'password-signin';

export interface Props {
  metaData: ISignUpInMetaData;
  customHeader?: JSX.Element;
  onSignInCompleted: (userId: string) => void;
  onGoToSignUp: () => void;
}

const SignIn = memo<Props>(
  ({ metaData, customHeader, onSignInCompleted, onGoToSignUp }) => {
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
      <Box id="e2e-sign-in-container">
        <StyledHeaderContainer
          className="signupinheadercontainer"
          inModal={!!metaData.inModal}
        >
          {!customHeader ? (
            <StyledHeaderTitle>
              <FormattedMessage {...messages.logIn} />
            </StyledHeaderTitle>
          ) : (
            customHeader
          )}
        </StyledHeaderContainer>

        <Box>
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
        </Box>
      </Box>
    );
  }
);

export default SignIn;
