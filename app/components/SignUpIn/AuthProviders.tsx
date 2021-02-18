import React, { memo, useCallback, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { isBoolean } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// components
import AuthProviderButton from './AuthProviderButton';
import Or from 'components/UI/Or';
import FranceConnectButton from 'components/UI/FranceConnectButton';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './SignUp/messages';

// styling
import styled from 'styled-components';
import { Options, Option } from 'components/SignUpIn/styles';

// typings
import { SSOProvider } from 'services/singleSignOn';
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const StyledAuthProviderButton = styled(AuthProviderButton)`
  margin-bottom: 18px;
`;

interface InputProps {
  metaData: ISignUpInMetaData;
  className?: string;
  onAuthProviderSelected: (selectedMethod: AuthProvider) => void;
  goToOtherFlow: () => void;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  passwordLoginEnabled: boolean | null;
  googleLoginEnabled: boolean | null;
  facebookLoginEnabled: boolean | null;
  azureAdLoginEnabled: boolean | null;
  franceconnectLoginEnabled: boolean | null;
}

interface Props extends InputProps, DataProps {}

export type AuthProvider = 'email' | SSOProvider;

const AuthProviders = memo<Props & InjectedIntlProps>(
  ({
    metaData,
    className,
    onAuthProviderSelected,
    goToOtherFlow,
    tenant,
    passwordLoginEnabled,
    googleLoginEnabled,
    facebookLoginEnabled,
    azureAdLoginEnabled,
    franceconnectLoginEnabled,
    intl: { formatMessage },
  }) => {
    const { flow, inModal, noPushLinks } = metaData;
    const azureProviderName = !isNilOrError(tenant)
      ? tenant?.attributes?.settings?.azure_ad_login?.login_mechanism_name
      : null;

    useEffect(() => {
      if (
        isBoolean(passwordLoginEnabled) &&
        isBoolean(googleLoginEnabled) &&
        isBoolean(facebookLoginEnabled) &&
        isBoolean(azureAdLoginEnabled) &&
        isBoolean(franceconnectLoginEnabled)
      ) {
        const enabledProviders = [
          passwordLoginEnabled,
          googleLoginEnabled,
          facebookLoginEnabled,
          azureAdLoginEnabled,
          franceconnectLoginEnabled,
        ].filter((provider) => provider === true);

        if (enabledProviders.length === 1 && passwordLoginEnabled) {
          onAuthProviderSelected('email');
        }
      }
    }, [
      passwordLoginEnabled,
      googleLoginEnabled,
      facebookLoginEnabled,
      azureAdLoginEnabled,
      franceconnectLoginEnabled,
      onAuthProviderSelected,
    ]);

    const handleOnAuthProviderSelected = useCallback(
      (authProvider: AuthProvider) => {
        onAuthProviderSelected(authProvider);
      },
      [onAuthProviderSelected]
    );

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

        if (inModal || noPushLinks) {
          goToOtherFlow();
        } else {
          clHistory.push(flow === 'signin' ? '/sign-up' : '/sign-in');
        }
      },
      [goToOtherFlow]
    );

    return (
      <Container className={className}>
        {passwordLoginEnabled && (
          <StyledAuthProviderButton
            flow={flow}
            authProvider="email"
            onContinue={handleOnAuthProviderSelected}
          >
            {flow === 'signup' ? (
              <FormattedMessage {...messages.signUpWithEmail} />
            ) : (
              <FormattedMessage {...messages.logInWithEmail} />
            )}
          </StyledAuthProviderButton>
        )}

        {googleLoginEnabled && (
          <StyledAuthProviderButton
            flow={flow}
            authProvider="google"
            onContinue={handleOnAuthProviderSelected}
          >
            <FormattedMessage {...messages.continueWithGoogle} />
          </StyledAuthProviderButton>
        )}

        {facebookLoginEnabled && (
          <StyledAuthProviderButton
            flow={flow}
            authProvider="facebook"
            onContinue={handleOnAuthProviderSelected}
          >
            <FormattedMessage {...messages.continueWithFacebook} />
          </StyledAuthProviderButton>
        )}

        {azureAdLoginEnabled && (
          <StyledAuthProviderButton
            flow={flow}
            authProvider="azureactivedirectory"
            onContinue={handleOnAuthProviderSelected}
          >
            <FormattedMessage
              {...messages.continueWithAzure}
              values={{ azureProviderName }}
            />
          </StyledAuthProviderButton>
        )}

        {(passwordLoginEnabled ||
          facebookLoginEnabled ||
          azureAdLoginEnabled) &&
          franceconnectLoginEnabled && <Or />}

        {franceconnectLoginEnabled && (
          <FranceConnectButton
            onClick={handleOnFranceConnectSelected}
            logoAlt={formatMessage(messages.signUpButtonAltText, {
              loginMechanismName: 'FranceConnect',
            })}
          />
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

const AuthProvidersWithHoC = injectIntl(AuthProviders);

const Data = adopt<DataProps, {}>({
  tenant: <GetAppConfiguration />,
  passwordLoginEnabled: <GetFeatureFlag name="password_login" />,
  googleLoginEnabled: <GetFeatureFlag name="google_login" />,
  facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  azureAdLoginEnabled: <GetFeatureFlag name="azure_ad_login" />,
  franceconnectLoginEnabled: <GetFeatureFlag name="franceconnect_login" />,
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps) => <AuthProvidersWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
