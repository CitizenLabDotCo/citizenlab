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
  color: ${colors.text};
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
  flex-basis: 0;
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
  color: ${colors.text};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  text-decoration: underline;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
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
  // const enabledMethodsCount = [passwordLoginEnabled, googleLoginEnabled, facebookLoginEnabled, franceconnectLoginEnabled, azureAdLoginEnabled].filter(method => method === true).length;

  // if (enabledMethodsCount === 1) {
  //   if (passwordLoginEnabled) {
  //     // automatically select password login when it's the only method that is enabled
  //     onAuthProviderSelected('email');
  //   }
  // }

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
  // if (enabledMethodsCount > 1 || (enabledMethodsCount === 1 && !passwordLoginEnabled)) {
  return (
    <Container className={className}>

      {passwordLoginEnabled &&
        <StyledAuthProviderButton
          flow={flow}
          authProvider="email"
          onContinue={handleOnAuthProviderSelected}
        >
          {flow === 'signup'
            ? <FormattedMessage {...messages.signUpWithEmail} />
            : <FormattedMessage {...messages.logInWithEmail} />
          }
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

      {(passwordLoginEnabled || facebookLoginEnabled || azureAdLoginEnabled) && franceconnectLoginEnabled &&
        <Or aria-hidden>
          <Line />
          <OrText><FormattedMessage {...messages.or} /></OrText>
          <Line />
        </Or>
      }

      {franceconnectLoginEnabled &&
        <FranceConnectButtonWrapper>
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
        </FranceConnectButtonWrapper>
      }

      <Options>
        <Option>
          <FormattedMessage
            {...flow === 'signup' ? messages.goToLogIn : messages.goToSignUp}
            values={{
              goToOtherFlowLink: (
              <button onClick={handleGoToOtherFlow} className="link">
                {formatMessage(flow === 'signup' ? messages.logIn2 : messages.signUp2)}
              </button>
              )
            }}
          />
        </Option>
      </Options>
    </Container>
  );
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
