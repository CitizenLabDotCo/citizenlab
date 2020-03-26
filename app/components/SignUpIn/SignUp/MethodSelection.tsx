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
import messages from './messages';

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

const SignUpMethodButton = styled(Button)`
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
  onMethodSelected: (selectedMethod: TSignUpMethods) => void;
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

export type TSignUpMethods = 'email' | SSOProvider;

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

  const handleMethodSelected = useCallback((method: TSignUpMethods) => (event: React.FormEvent) => {
    event.preventDefault();
    onMethodSelected(method);
  }, [onMethodSelected]);

  return (
    <Container className={className}>
      {passwordLoginEnabled &&
        <SignUpMethodButton
          icon="email"
          iconSize="22px"
          buttonStyle="white"
          fullWidth={true}
          justify="left"
          whiteSpace="wrap"
          onClick={handleMethodSelected('email')}
        >
          <FormattedMessage {...messages.continueWithEmail} />
        </SignUpMethodButton>
      }

      {googleLoginEnabled &&
        <SignUpMethodButton
          icon="google"
          iconSize="22px"
          buttonStyle="white"
          fullWidth={true}
          justify="left"
          whiteSpace="wrap"
          onClick={handleMethodSelected('google')}
        >
          <FormattedMessage {...messages.continueWithGoogle} />
        </SignUpMethodButton>
      }

      {facebookLoginEnabled &&
        <SignUpMethodButton
          icon="facebook"
          iconSize="22px"
          buttonStyle="white"
          fullWidth={true}
          justify="left"
          whiteSpace="wrap"
          onClick={handleMethodSelected('facebook')}
        >
          <FormattedMessage {...messages.continueWithFacebook} />
        </SignUpMethodButton>
      }

      {azureAdLoginEnabled &&
        <SignUpMethodButton
          icon="windows"
          iconSize="22px"
          buttonStyle="white"
          fullWidth={true}
          justify="left"
          whiteSpace="wrap"
          onClick={handleMethodSelected('azureactivedirectory')}
        >
          <FormattedMessage {...messages.continueWithAzure} values={{ azureProviderName }} />
        </SignUpMethodButton>
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
