import React, { memo, useCallback } from 'react';

// components
import AuthProviderButton, { TOnContinueFunction } from './AuthProviderButton';
import Or from 'components/UI/Or';
import FranceConnectButton from 'components/UI/FranceConnectButton';
import Outlet from 'components/Outlet';
import { Text } from '@citizenlab/cl2-component-library';
import TextButton from '../_components/TextButton';

// resources
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typings
import { SSOProvider } from 'api/authentication/singleSignOn';
import { ErrorCode } from 'containers/Authentication/typings';

// utils
import ClaveUnicaExpandedAuthProviderButton from './ClaveUnicaExpandedAuthProviderButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
`;

export const StyledAuthProviderButton = styled(AuthProviderButton)`
  margin-bottom: 18px;
`;

export const StyledClaveUnicaExpandedAuthProviderButton = styled(
  ClaveUnicaExpandedAuthProviderButton
)`
  margin-bottom: 18px;
`;

interface Props {
  flow: 'signup' | 'signin';
  className?: string;
  error: ErrorCode | null;
  onSelectAuthProvider: TOnContinueFunction;
  onSwitchFlow: () => void;
}

export type AuthProvider = 'email' | SSOProvider;

const AuthProviders = memo<Props>(
  ({ flow, className, error, onSwitchFlow, onSelectAuthProvider }) => {
    const { formatMessage } = useIntl();
    const { data: tenant } = useAppConfiguration();
    const tenantSettings = tenant?.data.attributes.settings;

    const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
    const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
    const facebookLoginEnabled = useFeatureFlag({ name: 'facebook_login' });
    const azureAdLoginEnabled = useFeatureFlag({ name: 'azure_ad_login' });
    const franceconnectLoginEnabled = useFeatureFlag({
      name: 'franceconnect_login',
    });
    const viennaCitizenLoginEnabled = useFeatureFlag({
      name: 'vienna_citizen_login',
    });
    const claveUnicaLoginEnabled = useFeatureFlag({
      name: 'clave_unica_login',
    });
    const hoplrLoginEnabled = useFeatureFlag({
      name: 'hoplr_login',
    });

    const azureProviderName =
      tenantSettings?.azure_ad_login?.login_mechanism_name;

    const handleOnFranceConnectSelected = useCallback(
      (event: React.FormEvent) => {
        event.preventDefault();
        onSelectAuthProvider('franceconnect');
      },
      [onSelectAuthProvider]
    );

    const handleGoToOtherFlow = useCallback(
      (event: React.FormEvent) => {
        event.preventDefault();
        onSwitchFlow();
      },
      [onSwitchFlow]
    );

    const phone = tenantSettings?.password_login?.phone;

    const isPasswordSigninOrSignupAllowed =
      passwordLoginEnabled &&
      (flow === 'signin' ||
        (flow === 'signup' && tenantSettings?.password_login?.enable_signup));

    const showFCButton =
      franceconnectLoginEnabled && error !== 'franceconnect_merging_failed';

    const showMainAuthMethods =
      isPasswordSigninOrSignupAllowed ||
      facebookLoginEnabled ||
      azureAdLoginEnabled ||
      viennaCitizenLoginEnabled ||
      claveUnicaLoginEnabled ||
      hoplrLoginEnabled;

    return (
      <Container
        id={
          flow === 'signup' ? 'e2e-sign-up-container' : 'e2e-sign-in-container'
        }
        className={className}
      >
        {showFCButton && (
          <FranceConnectButton
            onClick={handleOnFranceConnectSelected}
            logoAlt={formatMessage(messages.signUpButtonAltText, {
              loginMechanismName: 'FranceConnect',
            })}
          />
        )}

        {showMainAuthMethods && franceconnectLoginEnabled && <Or />}

        {claveUnicaLoginEnabled && (
          <StyledClaveUnicaExpandedAuthProviderButton
            flow={flow}
            onSelectAuthProvider={onSelectAuthProvider}
          />
        )}

        {hoplrLoginEnabled && (
          <StyledAuthProviderButton
            icon="hoplr"
            flow={flow}
            authProvider="hoplr"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage {...messages.continueWithHoplr} />
          </StyledAuthProviderButton>
        )}

        <Outlet
          id="app.components.SignUpIn.AuthProviders.ContainerStart"
          flow={flow}
          onContinue={onSelectAuthProvider}
        />

        {isPasswordSigninOrSignupAllowed && (
          <StyledAuthProviderButton
            flow={flow}
            icon="email"
            authProvider="email"
            onContinue={onSelectAuthProvider}
            id="e2e-login-with-email"
          >
            {flow === 'signup' ? (
              <FormattedMessage
                {...(phone
                  ? messages.signUpWithPhoneOrEmail
                  : messages.signUpWithEmail)}
              />
            ) : (
              <FormattedMessage
                {...(phone
                  ? messages.logInWithPhoneOrEmail
                  : messages.logInWithEmail)}
              />
            )}
          </StyledAuthProviderButton>
        )}

        {googleLoginEnabled && (
          <StyledAuthProviderButton
            flow={flow}
            icon="google"
            authProvider="google"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage {...messages.continueWithGoogle} />
          </StyledAuthProviderButton>
        )}

        {facebookLoginEnabled && (
          <StyledAuthProviderButton
            icon="facebook"
            flow={flow}
            authProvider="facebook"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage {...messages.continueWithFacebook} />
          </StyledAuthProviderButton>
        )}

        {azureAdLoginEnabled && (
          <StyledAuthProviderButton
            icon="microsoft-windows"
            flow={flow}
            authProvider="azureactivedirectory"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage
              {...messages.continueWithAzure}
              values={{ azureProviderName }}
            />
          </StyledAuthProviderButton>
        )}

        <Text m="0">
          <FormattedMessage
            {...(flow === 'signup' ? messages.goToLogIn : messages.goToSignUp)}
            values={{
              goToOtherFlowLink: (
                <TextButton
                  id="e2e-goto-signup"
                  onClick={handleGoToOtherFlow}
                  className="link"
                >
                  {formatMessage(
                    flow === 'signup' ? messages.logIn2 : messages.signUp2
                  )}
                </TextButton>
              ),
            }}
          />
        </Text>
      </Container>
    );
  }
);

export default AuthProviders;
