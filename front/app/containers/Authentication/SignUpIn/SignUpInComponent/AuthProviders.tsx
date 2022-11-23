import React, { memo, useCallback, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { isBoolean } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// components
import AuthProviderButton, { TOnContinueFunction } from './AuthProviderButton';
import Or from 'components/UI/Or';
import FranceConnectButton from 'components/UI/FranceConnectButton';
import Outlet from 'components/Outlet';
import Error from 'components/UI/Error';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './SignUp/messages';

// styling
import styled from 'styled-components';
import { Options, Option } from 'components/SignUpIn/styles';

// typings
import { SSOProvider } from 'services/singleSignOn';
import { ISignUpInMetaData } from 'events/openSignUpInModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const StyledAuthProviderButton = styled(AuthProviderButton)`
  margin-bottom: 18px;
`;

interface InputProps {
  metaData: ISignUpInMetaData;
  className?: string;
  onAuthProviderSelected: TOnContinueFunction;
  goToOtherFlow: () => void;
}

interface DataProps {
  azureAdLoginEnabled: boolean | null;
  facebookLoginEnabled: boolean | null;
  franceconnectLoginEnabled: boolean | null;
  googleLoginEnabled: boolean | null;
  passwordLoginEnabled: boolean | null;
  tenant: GetAppConfigurationChildProps;
  viennaCitizenLoginEnabled: boolean | null;
}

interface Props extends InputProps, DataProps {}

export type AuthProvider = 'email' | SSOProvider;

const AuthProviders = memo<Props & WrappedComponentProps>(
  ({
    azureAdLoginEnabled,
    className,
    facebookLoginEnabled,
    franceconnectLoginEnabled,
    goToOtherFlow,
    googleLoginEnabled,
    intl: { formatMessage },
    metaData,
    onAuthProviderSelected,
    passwordLoginEnabled,
    tenant,
    viennaCitizenLoginEnabled,
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
        isBoolean(franceconnectLoginEnabled) &&
        isBoolean(viennaCitizenLoginEnabled)
      ) {
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

        if (inModal || noPushLinks) {
          goToOtherFlow();
        } else {
          clHistory.push(flow === 'signin' ? '/sign-up' : '/sign-in');
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [goToOtherFlow]
    );

    const phone =
      !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;

    const isPasswordSigninOrSignupAllowed =
      passwordLoginEnabled &&
      (flow === 'signin' ||
        (flow === 'signup' &&
          !isNilOrError(tenant) &&
          tenant.attributes.settings.password_login?.enable_signup));

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

const AuthProvidersWithHoC = injectIntl(AuthProviders);

const Data = adopt<DataProps>({
  tenant: <GetAppConfiguration />,
  azureAdLoginEnabled: <GetFeatureFlag name="azure_ad_login" />,
  facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  franceconnectLoginEnabled: <GetFeatureFlag name="franceconnect_login" />,
  googleLoginEnabled: <GetFeatureFlag name="google_login" />,
  passwordLoginEnabled: <GetFeatureFlag name="password_login" />,
  viennaCitizenLoginEnabled: <GetFeatureFlag name="vienna_citizen_login" />,
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps: DataProps) => (
      <AuthProvidersWithHoC {...inputProps} {...dataProps} />
    )}
  </Data>
);
