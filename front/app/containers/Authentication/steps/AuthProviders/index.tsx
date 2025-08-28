import React, { memo, useCallback } from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { SSOProvider } from 'api/authentication/singleSignOn';

import { ErrorCode } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import Outlet from 'components/Outlet';
import FranceConnectButton from 'components/UI/FranceConnectButton';
import Or from 'components/UI/Or';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import TextButton from '../_components/TextButton';

import AuthProviderButton, { TOnContinueFunction } from './AuthProviderButton';
import ClaveUnicaExpandedAuthProviderButton from './ClaveUnicaExpandedAuthProviderButton';
import messages from './messages';

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
    const { passwordLoginEnabled, anySSOProviderEnabled, ssoProviders } =
      useAuthConfig();

    // Show link to the above hidden path
    const showAdminLoginLink =
      flow === 'signin' &&
      tenantSettings?.azure_ad_login?.visibility === 'link';

    const azureProviderName =
      tenantSettings?.azure_ad_login?.login_mechanism_name;
    const azureB2cProviderName =
      tenantSettings?.azure_ad_b2c_login?.login_mechanism_name;

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

    const isPasswordSigninOrSignupAllowed =
      passwordLoginEnabled &&
      (flow === 'signin' || tenantSettings?.password_login?.enable_signup);

    const showFCButton =
      ssoProviders.franceconnect && error !== 'franceconnect_merging_failed';

    const showMainAuthMethods =
      isPasswordSigninOrSignupAllowed || anySSOProviderEnabled;

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
        {showMainAuthMethods && ssoProviders.franceconnect && <Or />}
        {ssoProviders.fakeSso && (
          <StyledAuthProviderButton
            icon="bullseye"
            flow={flow}
            authProvider="fake_sso"
            onContinue={onSelectAuthProvider}
            id="e2e-login-with-fake-sso"
          >
            <FormattedMessage {...messages.continueWithFakeSSO} />
          </StyledAuthProviderButton>
        )}
        {ssoProviders.claveUnica && (
          <StyledClaveUnicaExpandedAuthProviderButton
            flow={flow}
            onSelectAuthProvider={onSelectAuthProvider}
          />
        )}
        {ssoProviders.hoplr && (
          <StyledAuthProviderButton
            icon="hoplr"
            flow={flow}
            authProvider="hoplr"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage {...messages.continueWithHoplr} />
          </StyledAuthProviderButton>
        )}
        {ssoProviders.nemlogIn && (
          <StyledAuthProviderButton
            flow={flow}
            authProvider="nemlog_in"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage {...messages.continueWithNemlogIn} />
          </StyledAuthProviderButton>
        )}
        {ssoProviders.idAustria && (
          <StyledAuthProviderButton
            icon="idaustria"
            flow={flow}
            authProvider="id_austria"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage
              {...messages.continueWithLoginMechanism}
              values={{
                loginMechanismName: 'ID Austria',
              }}
            />
          </StyledAuthProviderButton>
        )}
        {ssoProviders.criipto && (
          <StyledAuthProviderButton
            icon="mitid"
            flow={flow}
            authProvider="criipto"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage
              {...messages.continueWithLoginMechanism}
              values={{
                loginMechanismName:
                  process.env.NODE_ENV === 'development'
                    ? 'MitID (Criipto)'
                    : 'MitID',
              }}
            />
          </StyledAuthProviderButton>
        )}
        {ssoProviders.keycloak && (
          <StyledAuthProviderButton
            icon="idporten"
            flow={flow}
            authProvider="keycloak"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage
              {...messages.continueWithLoginMechanism}
              values={{
                loginMechanismName: 'ID-Porten',
              }}
            />
          </StyledAuthProviderButton>
        )}
        {ssoProviders.twoday && (
          <StyledAuthProviderButton
            icon="bankId"
            flow={flow}
            authProvider="twoday"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage
              {...messages.continueWithLoginMechanism}
              values={{
                loginMechanismName: 'BankID eller Freja eID+',
              }}
            />
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
              <FormattedMessage {...messages.signUpWithEmail} />
            ) : (
              <FormattedMessage {...messages.logInWithEmail} />
            )}
          </StyledAuthProviderButton>
        )}
        {ssoProviders.google && (
          <StyledAuthProviderButton
            flow={flow}
            icon="google"
            authProvider="google"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage {...messages.continueWithGoogle} />
          </StyledAuthProviderButton>
        )}
        {ssoProviders.facebook && (
          <StyledAuthProviderButton
            icon="facebook"
            flow={flow}
            authProvider="facebook"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage {...messages.continueWithFacebook} />
          </StyledAuthProviderButton>
        )}
        {ssoProviders.azureAd && (
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
        {ssoProviders.azureAdB2c && (
          <StyledAuthProviderButton
            icon="microsoft-windows"
            flow={flow}
            authProvider="azureactivedirectory_b2c"
            onContinue={onSelectAuthProvider}
          >
            <FormattedMessage
              {...messages.continueWithAzure}
              values={{ azureProviderName: azureB2cProviderName }}
            />
          </StyledAuthProviderButton>
        )}
        {passwordLoginEnabled && (
          <Text m="0">
            <FormattedMessage
              {...(flow === 'signup'
                ? messages.goToLogIn
                : messages.goToSignUp)}
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
        )}
        {showAdminLoginLink && (
          <Link to="/sign-in/admin">
            <Text
              fontSize="xs"
              textDecoration="underline"
              color="textSecondary"
            >
              <FormattedMessage {...messages.adminOptions} />
            </Text>
          </Link>
        )}
      </Container>
    );
  }
);

export default AuthProviders;
