import React, { memo,  useCallback } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import AuthProviderButton from './AuthProviderButton';
import franceConnectLogo from 'components/SignUpIn/svg/franceconnect.svg';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './SignUp/messages';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { Options, Option } from 'components/SignUpIn/styles';

// typings
import { SSOProvider } from 'services/singleSignOn';
import { TSignUpInFlow } from 'components/SignUpIn';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const StyledAuthProviderButton = styled(AuthProviderButton)`
  margin-bottom: 20px;
`;

const FranceConnectButton = styled.button`
  text-align: left;
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-top: 10px;

  &:disabled {
    cursor: not-allowed;
  }

  &:not(:disabled) {
    &:hover {
      border-color: #0e4fa1;
    }
  }
`;

const SubSocialButtonLink = styled.a`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  text-decoration: none;
  padding-top: 0.2em;
`;

interface InputProps {
  flow: TSignUpInFlow;
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

interface Props extends InputProps, DataProps { }

export type AuthProvider = 'email' | SSOProvider;

const AuthProviders = memo<Props & InjectedIntlProps>(({
  flow,
  className,
  onAuthProviderSelected,
  goToOtherFlow,
  tenant,
  passwordLoginEnabled,
  googleLoginEnabled,
  facebookLoginEnabled,
  azureAdLoginEnabled,
  franceconnectLoginEnabled,
  intl: { formatMessage }
}) => {

  const azureProviderName = !isNilOrError(tenant) ? tenant?.attributes?.settings?.azure_ad_login?.login_mechanism_name : null;
  const enabledMethodsCount = [passwordLoginEnabled, googleLoginEnabled, facebookLoginEnabled, franceconnectLoginEnabled, azureAdLoginEnabled].filter(method => method === true).length;

  if (enabledMethodsCount === 1) {
    if (passwordLoginEnabled) {
      // automatically select password login when it's the only method that is enabled
      onAuthProviderSelected('email');
    }
  }

  const handleOnAuthProviderSelected = useCallback((authProvider: AuthProvider) => {
    onAuthProviderSelected(authProvider);
  }, [onAuthProviderSelected]);

  const handleOnFranceConnectSelected = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    onAuthProviderSelected('franceconnect');
  }, [onAuthProviderSelected]);

  const handleGoToOtherFlow = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    goToOtherFlow();
  }, [goToOtherFlow]);

  // show this step only when more than 1 method enabled or when only 1 method is enabled and that method isn't passwordLogin
  if (enabledMethodsCount > 1 || (enabledMethodsCount === 1 && !passwordLoginEnabled)) {
    return (
      <Container className={className}>

        {passwordLoginEnabled &&
          <StyledAuthProviderButton
            flow={flow}
            authProvider="email"
            onContinue={handleOnAuthProviderSelected}
          >
            <FormattedMessage {...messages.continueWithEmail} />
          </StyledAuthProviderButton>
        }

        {googleLoginEnabled &&
          <StyledAuthProviderButton
            flow={flow}
            authProvider="google"
            onContinue={handleOnAuthProviderSelected}
          >
            <FormattedMessage {...messages.continueWithGoogle} />
          </StyledAuthProviderButton>
        }

        {facebookLoginEnabled &&
          <StyledAuthProviderButton
            flow={flow}
            authProvider="facebook"
            onContinue={handleOnAuthProviderSelected}
          >
            <FormattedMessage {...messages.continueWithFacebook} />
          </StyledAuthProviderButton>
        }

        {azureAdLoginEnabled &&
          <StyledAuthProviderButton
            flow={flow}
            authProvider="azureactivedirectory"
            onContinue={handleOnAuthProviderSelected}
          >
            <FormattedMessage {...messages.continueWithAzure} values={{ azureProviderName }} />
          </StyledAuthProviderButton>
        }

        {franceconnectLoginEnabled &&
          <>
            <FranceConnectButton onClick={handleOnFranceConnectSelected}>
              <img
                src={franceConnectLogo}
                alt={formatMessage(messages.signUpButtonAltText, { loginMechanismName: 'FranceConnect' })}
              />
            </FranceConnectButton>
            <SubSocialButtonLink
              href="https://app.franceconnect.gouv.fr/en-savoir-plus"
              target="_blank"
            >
              <FormattedMessage {...messages.whatIsFranceConnect} />
            </SubSocialButtonLink>
          </>
        }

        <Options>
          <Option>
            <FormattedMessage
              {...flow === 'signup' ? messages.goToLogIn : messages.goToSignUp}
              values={{
                goToOtherFlowLink: (
                <button onClick={handleGoToOtherFlow}>
                  {formatMessage(flow === 'signup' ? messages.logIn2 : messages.signUp2)}
                </button>
                )
              }}
            />
          </Option>
        </Options>
      </Container>
    );
  }

  return null;
});

const AuthProvidersWithHoC = injectIntl(AuthProviders);

const Data = adopt<DataProps, {}>({
  tenant: <GetTenant />,
  passwordLoginEnabled: <GetFeatureFlag name="password_login" />,
  googleLoginEnabled: <GetFeatureFlag name="google_login" />,
  facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  azureAdLoginEnabled: <GetFeatureFlag name="azure_ad_login" />,
  franceconnectLoginEnabled: <GetFeatureFlag name="franceconnect_login" />
});

export default (inputProps: InputProps) => (
  <Data>
    {dataProps => <AuthProvidersWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
