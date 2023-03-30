import React, { memo, useCallback, useEffect } from 'react';

// components
import AuthProviderButton, { TOnContinueFunction } from './AuthProviderButton';
import Or from 'components/UI/Or';
import FranceConnectButton from 'components/UI/FranceConnectButton';
import Outlet from 'components/Outlet';
import Error from 'components/UI/Error';

// resources
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { Options, Option } from './styles';

// typings
import { SSOProvider } from 'services/singleSignOn';
import { ISignUpInMetaData } from 'events/openSignUpInModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
`;

export const StyledAuthProviderButton = styled(AuthProviderButton)`
  margin-bottom: 18px;
`;

interface Props {
  metaData: ISignUpInMetaData;
  className?: string;
  onAuthProviderSelected: TOnContinueFunction;
  goToOtherFlow: () => void;
}

export type AuthProvider = 'email' | SSOProvider;

const AuthProviders = memo<Props>(
  ({ className, goToOtherFlow, metaData, onAuthProviderSelected }) => {
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

    const { flow } = metaData;
    const azureProviderName =
      tenantSettings?.azure_ad_login?.login_mechanism_name;

    useEffect(() => {
      const enabledProviders = [
        passwordLoginEnabled,
        googleLoginEnabled,
        facebookLoginEnabled,
        azureAdLoginEnabled,
        franceconnectLoginEnabled,
        viennaCitizenLoginEnabled,
      ].filter((provider) => provider === true);

      if (enabledProviders.length === 1 && passwordLoginEnabled) {
        onAuthProviderSelected('email');
      }
    }, [
      passwordLoginEnabled,
      googleLoginEnabled,
      facebookLoginEnabled,
      azureAdLoginEnabled,
      franceconnectLoginEnabled,
      viennaCitizenLoginEnabled,
      onAuthProviderSelected,
    ]);

    const handleOnFranceConnectSelected = useCallback(
      (event: React.FormEvent) => {
        event.preventDefault();
        onAuthProviderSelected('franceconnect');
      },
      [onAuthProviderSelected]
    );

    const handleGoToOtherFlow = useCallback(
      (event: React.FormEvent) => {
        event.preventDefault();
        goToOtherFlow();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [goToOtherFlow]
    );

    const phone = tenantSettings?.password_login?.phone;

    const isPasswordSigninOrSignupAllowed =
      passwordLoginEnabled &&
      (flow === 'signin' ||
        (flow === 'signup' && tenantSettings?.password_login?.enable_signup));

    return (
      <Container className={className}>
        {franceconnectLoginEnabled &&
          (metaData.error?.code === 'franceconnect_merging_failed' ? (
            <Error
              text={
                <FormattedMessage
                  {...messages.franceConnectMergingFailed}
                  values={{ br: <br /> }}
                />
              }
              animate={false}
              marginBottom="30px"
            />
          ) : (
            <FranceConnectButton
              onClick={handleOnFranceConnectSelected}
              logoAlt={formatMessage(messages.signUpButtonAltText, {
                loginMechanismName: 'FranceConnect',
              })}
            />
          ))}

        {(isPasswordSigninOrSignupAllowed ||
          facebookLoginEnabled ||
          azureAdLoginEnabled) &&
          franceconnectLoginEnabled &&
          !metaData.error && <Or />}

        <Outlet
          id="app.components.SignUpIn.AuthProviders.ContainerStart"
          flow={flow}
          onContinue={onAuthProviderSelected}
        />

        {isPasswordSigninOrSignupAllowed && (
          <StyledAuthProviderButton
            flow={flow}
            icon="email"
            authProvider="email"
            onContinue={onAuthProviderSelected}
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
            onContinue={onAuthProviderSelected}
          >
            <FormattedMessage {...messages.continueWithGoogle} />
          </StyledAuthProviderButton>
        )}

        {facebookLoginEnabled && (
          <StyledAuthProviderButton
            icon="facebook"
            flow={flow}
            authProvider="facebook"
            onContinue={onAuthProviderSelected}
          >
            <FormattedMessage {...messages.continueWithFacebook} />
          </StyledAuthProviderButton>
        )}

        {azureAdLoginEnabled && (
          <StyledAuthProviderButton
            icon="microsoft-windows"
            flow={flow}
            authProvider="azureactivedirectory"
            onContinue={onAuthProviderSelected}
          >
            <FormattedMessage
              {...messages.continueWithAzure}
              values={{ azureProviderName }}
            />
          </StyledAuthProviderButton>
        )}

        <Options>
          <Option>
            <FormattedMessage
              {...(flow === 'signup'
                ? messages.goToLogIn
                : messages.goToSignUp)}
              values={{
                goToOtherFlowLink: (
                  <button onClick={handleGoToOtherFlow} className="link">
                    {formatMessage(
                      flow === 'signup' ? messages.logIn2 : messages.signUp2
                    )}
                  </button>
                ),
              }}
            />
          </Option>
        </Options>
      </Container>
    );
  }
);

export default AuthProviders;
