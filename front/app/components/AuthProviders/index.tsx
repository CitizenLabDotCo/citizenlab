import React, { memo, useCallback, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { isBoolean } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import AuthProviderButton, { TOnContinueFunction } from './AuthProviderButton';
import Or from 'components/UI/Or';
import FranceConnectButton from 'components/UI/FranceConnectButton';
import Error from 'components/UI/Error';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
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
  }) => {
    const { flow } = metaData;

    useEffect(() => {
      if (
        isBoolean(passwordLoginEnabled) &&
        isBoolean(googleLoginEnabled) &&
        isBoolean(facebookLoginEnabled)
      ) {
        const enabledProviders = [
          passwordLoginEnabled,
          googleLoginEnabled,
          facebookLoginEnabled,
        ].filter((provider) => provider === true);

        if (enabledProviders.length === 1 && passwordLoginEnabled) {
          onAuthProviderSelected('email');
        }
      }
    }, [
      passwordLoginEnabled,
      googleLoginEnabled,
      facebookLoginEnabled,
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
  facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  googleLoginEnabled: <GetFeatureFlag name="google_login" />,
  passwordLoginEnabled: <GetFeatureFlag name="password_login" />,
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps: DataProps) => (
      <AuthProvidersWithHoC {...inputProps} {...dataProps} />
    )}
  </Data>
);
