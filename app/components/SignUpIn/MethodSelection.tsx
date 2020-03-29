import React, { memo,  useCallback } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
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

// typings
import { SSOProvider } from 'services/singleSignOn';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const SignUpInButton = styled(Button)`
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
  className?: string;
  onMethodSelected: (selectedMethod: TSignUpInMethods) => void;
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

export type TSignUpInMethods = 'email' | SSOProvider;

const MethodSelection = memo<Props & InjectedIntlProps>(({
  className,
  onMethodSelected,
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
      onMethodSelected('email');
    }
  }

  const handleMethodSelected = useCallback((method: TSignUpInMethods) => (event: React.FormEvent) => {
    event.preventDefault();
    onMethodSelected(method);
  }, [onMethodSelected]);

  // show this step only when more than 1 method enabled or when only 1 method is enabled and that method isn't passwordLogin
  if (enabledMethodsCount > 1 || (enabledMethodsCount === 1 && !passwordLoginEnabled)) {
    return (
      <Container className={className}>
        {passwordLoginEnabled &&
          <SignUpInButton
            icon="email"
            iconSize="22px"
            buttonStyle="white"
            fullWidth={true}
            justify="left"
            whiteSpace="wrap"
            onClick={handleMethodSelected('email')}
          >
            <FormattedMessage {...messages.continueWithEmail} />
          </SignUpInButton>
        }

        {googleLoginEnabled &&
          <SignUpInButton
            icon="google"
            iconSize="22px"
            buttonStyle="white"
            fullWidth={true}
            justify="left"
            whiteSpace="wrap"
            onClick={handleMethodSelected('google')}
          >
            <FormattedMessage {...messages.continueWithGoogle} />
          </SignUpInButton>
        }

        {facebookLoginEnabled &&
          <SignUpInButton
            icon="facebook"
            iconSize="22px"
            buttonStyle="white"
            fullWidth={true}
            justify="left"
            whiteSpace="wrap"
            onClick={handleMethodSelected('facebook')}
          >
            <FormattedMessage {...messages.continueWithFacebook} />
          </SignUpInButton>
        }

        {azureAdLoginEnabled &&
          <SignUpInButton
            icon="windows"
            iconSize="22px"
            buttonStyle="white"
            fullWidth={true}
            justify="left"
            whiteSpace="wrap"
            onClick={handleMethodSelected('azureactivedirectory')}
          >
            <FormattedMessage {...messages.continueWithAzure} values={{ azureProviderName }} />
          </SignUpInButton>
        }

        {franceconnectLoginEnabled &&
          <>
            <FranceConnectButton onClick={handleMethodSelected('franceconnect')}>
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
      </Container>
    );
  }

  return null;
});

const MethodSelectionWithHoC = injectIntl(MethodSelection);

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
    {dataProps => <MethodSelectionWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
