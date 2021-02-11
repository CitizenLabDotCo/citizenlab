import React, { memo, useCallback, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { isBoolean } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// components
import AuthProviderButton from './AuthProviderButton';
import franceConnectLogo from 'components/SignUpIn/svg/franceconnect.svg';

// resources
import GetAppConfiguration, { GetTenantChildProps } from 'resources/GetTenant';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './SignUp/messages';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
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

const Or = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 25px;
`;

const Line = styled.span`
  flex: 1;
  height: 1px;
  background: #e0e0e0;
`;

const OrText = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  text-transform: lowercase;
  padding-left: 10px;
  padding-right: 10px;
`;

const FranceConnectButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const FranceConnectButton = styled.button`
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: auto;
  text-align: left;
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-bottom: 2px;

  &:disabled {
    cursor: not-allowed;
  }
`;

const SubSocialButtonLink = styled.a`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  text-decoration: underline;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

interface InputProps {
  metaData: ISignUpInMetaData;
  className?: string;
  onAuthProviderSelected: (selectedMethod: AuthProvider) => void;
  goToOtherFlow: () => void;
}

interface DataProps {
  tenant: GetTenantChildProps;
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
          franceconnectLoginEnabled && (
            <Or aria-hidden>
              <Line />
              <OrText>
                <FormattedMessage {...messages.or} />
              </OrText>
              <Line />
            </Or>
          )}

        {franceconnectLoginEnabled && (
          <FranceConnectButtonWrapper>
            <FranceConnectButton onClick={handleOnFranceConnectSelected}>
              <img
                src={franceConnectLogo}
                alt={formatMessage(messages.signUpButtonAltText, {
                  loginMechanismName: 'FranceConnect',
                })}
              />
            </FranceConnectButton>
            <SubSocialButtonLink
              href="https://app.franceconnect.gouv.fr/en-savoir-plus"
              target="_blank"
            >
              <FormattedMessage {...messages.whatIsFranceConnect} />
            </SubSocialButtonLink>
          </FranceConnectButtonWrapper>
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
