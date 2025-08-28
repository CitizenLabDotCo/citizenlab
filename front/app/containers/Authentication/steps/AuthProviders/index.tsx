import React, { memo, useCallback } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { SSOProvider } from 'api/authentication/singleSignOn';

import { ErrorCode } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import FranceConnectButton from 'components/UI/FranceConnectButton';
import Or from 'components/UI/Or';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import AuthProviderButton, {
  TOnContinueFunction,
  Props as AuthProviderButtonProps,
} from '../_components/AuthProviderButton';
import SSOButtonsExceptFC from '../_components/SSOButtonsExceptFC';
import TextButton from '../_components/TextButton';

import messages from './messages';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
`;

const WrappedAuthProviderButton = (props: AuthProviderButtonProps) => (
  <Box mb="18px">
    <AuthProviderButton {...props} />
  </Box>
);

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

    const showConsent = flow === 'signup';

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
        {isPasswordSigninOrSignupAllowed && (
          <WrappedAuthProviderButton
            showConsent={showConsent}
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
          </WrappedAuthProviderButton>
        )}
        <SSOButtonsExceptFC
          showConsent={showConsent}
          flow={flow}
          onSelectAuthProvider={onSelectAuthProvider}
        />
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
