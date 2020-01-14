import React, { Provider } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import Link from 'utils/cl-router/Link';

// components
import FeatureFlag from 'components/FeatureFlag';
import AuthProviderButton from 'components/AuthProviderButton';

// resources
import { GetTenantChildProps } from 'resources/GetTenant';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// logos
import franceconnectLogo from 'components/AuthProviderButton/svg/franceconnect.svg';
import { handleOnSSOClick, SSOProvider } from 'services/singleSignOn';

const Container = styled.div`
  width: 100%;
  margin-bottom: 50px;
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: transparent;
  border-bottom: solid 1px #ccc;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const FooterContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const AuthProviderButtons = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const FranceConnectButton = styled.button`
  cursor: pointer;
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

const SocialSignUpText = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: 20px;
  margin-left: 4px;
  margin-bottom: 15px;
`;

const SubSocialButtonLink = styled.a`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  text-decoration: none;
  padding-top: 0.2em;
`;

const AlreadyHaveAnAccount = styled(Link)`
  color: ${(props) => props.theme.colorMain};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
  }
`;

interface InputProps {
  goToSignIn: () => void;
  tenant: GetTenantChildProps;
}

interface DataProps {
  passwordLoginEnabled: boolean | null;
  googleLoginEnabled: boolean | null;
  facebookLoginEnabled: boolean | null;
  azureAdLoginEnabled: boolean | null;
  franceconnectLoginEnabled: boolean | null;
}

interface Props extends InputProps, DataProps { }

class Footer extends React.PureComponent<Props & InjectedIntlProps> {

  handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  }

  handleOnClick = () => {
    this.props.goToSignIn();
  }

  handleOnAccept = (provider: SSOProvider) => () => {
    setTimeout(() => handleOnSSOClick(provider)(), 200);
  }

  externalLoginsCount = () => {
    const { googleLoginEnabled, facebookLoginEnabled, azureAdLoginEnabled, franceconnectLoginEnabled } = this.props;
    const logins = [googleLoginEnabled, facebookLoginEnabled, azureAdLoginEnabled, franceconnectLoginEnabled];
    return logins.reduce((count, method) => count + (method ? 1 : 0), 0);
  }

  render() {
    const { passwordLoginEnabled, tenant } = this.props;
    const { formatMessage } = this.props.intl;
    const externalLoginsCount = this.externalLoginsCount();

    if (isNilOrError(tenant)) return null;

    const azureProviderName = tenant ?.attributes ?.settings ?.azure_ad_login ?.login_mechanism_name;

    if (externalLoginsCount > 0) {
      return (
        <>
          {passwordLoginEnabled &&
            <Separator />
          }
          <Container>
            <FooterContent>
              {passwordLoginEnabled &&
                <SocialSignUpText>
                  {formatMessage(messages.orSignUpWith)}
                </SocialSignUpText>
              }
              <AuthProviderButtons>
                {azureProviderName &&
                  <FeatureFlag name="azure_ad_login">
                    <AuthProviderButton
                      provider="azureactivedirectory"
                      providerName={azureProviderName}
                      mode="signUp"
                      onAccept={this.handleOnAccept('azureactivedirectory')}
                    />
                  </FeatureFlag>
                }
                <FeatureFlag name="franceconnect_login">
                  <FranceConnectButton
                    role="button"
                    onClick={this.handleOnAccept('franceconnect')}
                  >
                    <img
                      src={franceconnectLogo}
                      alt={formatMessage(messages.signUpButtonAltText, { loginMechanismName: 'FranceConnect' })}
                    />
                  </FranceConnectButton>
                  <SubSocialButtonLink
                    href="https://app.franceconnect.gouv.fr/en-savoir-plus"
                    target="_blank"
                  >
                    <FormattedMessage {...messages.whatIsFranceConnect} />
                  </SubSocialButtonLink>
                </FeatureFlag>
                <FeatureFlag name="google_login">
                  <AuthProviderButton
                    provider="google"
                    providerName="Google"
                    mode="signUp"
                    onAccept={this.handleOnAccept('google')}
                  />
                </FeatureFlag>
                <FeatureFlag name="facebook_login">
                  <AuthProviderButton
                    provider="facebook"
                    providerName="Facebook"
                    mode="signUp"
                    onAccept={this.handleOnAccept('facebook')}
                  />
                </FeatureFlag>
              </AuthProviderButtons>
              {!passwordLoginEnabled &&
                <AlreadyHaveAnAccount to="/sign-in">
                  <FormattedMessage {...messages.alreadyHaveAnAccount} />
                </AlreadyHaveAnAccount>
              }
            </FooterContent>
          </Container>
        </>
      );
    }

    return null;
  }
}

const FooterWithInjectedIntl = injectIntl<Props>(Footer);

const Data = adopt<DataProps, {}>({
  passwordLoginEnabled: <GetFeatureFlag name="password_login" />,
  googleLoginEnabled: <GetFeatureFlag name="google_login" />,
  facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  azureAdLoginEnabled: <GetFeatureFlag name="azure_ad_login" />,
  franceconnectLoginEnabled: <GetFeatureFlag name="franceconnect_login" />,
});

export default (inputProps: InputProps) => (
  <Data>
    {dataProps => <FooterWithInjectedIntl {...inputProps} {...dataProps} />}
  </Data>
);
