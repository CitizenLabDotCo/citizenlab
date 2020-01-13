import React from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import Link from 'utils/cl-router/Link';

// components
import FeatureFlag from 'components/FeatureFlag';
import AuthProviderButton, { Provider } from 'components/AuthProviderButton';

// resources
import { GetTenantChildProps } from 'resources/GetTenant';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { AUTH_PATH } from 'containers/App/constants';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// logos
import googleLogo from 'components/AuthProviderButton/svg/google.svg';
import facebookLogo from 'components/AuthProviderButton/svg/facebook.svg';
import franceconnectLogo from 'components/AuthProviderButton/svg/franceconnect.svg';
import Checkbox from 'components/UI/Checkbox';

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

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TermsAndConditionsWrapper = styled.div`
  padding: 15px 20px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${darken(0.04, colors.background)};

  span {
    color: ${colors.text} !important;
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: 21px;
  }

  a > span {
    color: ${colors.text} !important;
    text-decoration: underline;
  }

  a:hover > span {
    color: #000 !important;
    text-decoration: underline;
  }
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

interface State {
  tacAccepted: boolean;
  privacyAccepted: boolean;
  emailAccepted: boolean;
}

class Footer extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      tacAccepted: false,
      privacyAccepted: false,
      emailAccepted: false
    };
  }

  handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  }

  handleTaCAcceptedOnChange = (event) => {
    event.stopPropagation();

    this.setState(({ tacAccepted }) => ({ tacAccepted: !tacAccepted }));
  }

  handlePrivacyAcceptedOnChange = (event) => {
    event.stopPropagation();

    this.setState(({ privacyAccepted }) => ({ privacyAccepted: !privacyAccepted }));
  }

  handleEmailAcceptedOnChange = (event) => {
    event.stopPropagation();

    this.setState(({ emailAccepted }) => ({ emailAccepted: !emailAccepted }));
  }

  handleOnClick = () => {
    this.props.goToSignIn();
  }

  handleOnAccept = (provider: Provider) => () => {
    setTimeout(() => {
      window.location.href = `${AUTH_PATH}/${provider}`;
    }, 200);
  }

  externalLoginsCount = () => {
    const { googleLoginEnabled, facebookLoginEnabled, azureAdLoginEnabled, franceconnectLoginEnabled } = this.props;
    const logins = [googleLoginEnabled, facebookLoginEnabled, azureAdLoginEnabled, franceconnectLoginEnabled];
    return logins.reduce((count, method) => count + (method ? 1 : 0), 0);
  }

  render() {
    const { tenant, passwordLoginEnabled } = this.props;
    const { formatMessage } = this.props.intl;
    const { tacAccepted, privacyAccepted, emailAccepted } = this.state;
    const privacyChecksAccepted = tacAccepted && privacyAccepted && emailAccepted;
    const externalLoginsCount = this.externalLoginsCount();
    const azureAdLogoUrl: string = get(tenant, 'attributes.settings.azure_ad_login.logo_url');
    const AzureProviderName: string = get(tenant, 'attributes.settings.azure_ad_login.login_mechanism_name');

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
              <CheckboxContainer>
                <TermsAndConditionsWrapper>
                  <Checkbox
                    id="terms-and-conditions-checkbox"
                    className="e2e-terms-and-conditions"
                    checked={this.state.tacAccepted}
                    onChange={this.handleTaCAcceptedOnChange}
                    label={
                      <FormattedMessage
                        {...messages.tacApproval}
                        values={{
                          tacLink: <Link
                            target="_blank"
                            to="/pages/terms-and-conditions"
                            onClick={this.handleLinkClick}
                          >
                            <FormattedMessage {...messages.termsAndConditions} />
                          </Link>,
                        }}
                      />
                    }
                  />
                </TermsAndConditionsWrapper>
                <TermsAndConditionsWrapper>
                  <Checkbox
                    id="privacy-checkbox"
                    className="e2e-privacy-checkbox"
                    checked={this.state.privacyAccepted}
                    onChange={this.handlePrivacyAcceptedOnChange}
                    label={
                      <FormattedMessage
                        {...messages.privacyApproval}
                        values={{
                          ppLink: <Link
                            target="_blank"
                            to="/pages/privacy-policy"
                            onClick={this.handleLinkClick}
                          >
                            <FormattedMessage {...messages.privacyPolicy} />
                          </Link>,
                        }}
                      />
                    }
                  />
                </TermsAndConditionsWrapper>
                <TermsAndConditionsWrapper>
                  <Checkbox
                    id="privacy-checkbox"
                    className="e2e-email-checkbox"
                    checked={this.state.emailAccepted}
                    onChange={this.handleEmailAcceptedOnChange}
                    label={
                      <FormattedMessage
                        {...messages.emailApproval}
                      />
                    }
                  />
                </TermsAndConditionsWrapper>
              </CheckboxContainer>
              <AuthProviderButtons>
                <FeatureFlag name="azure_ad_login">
                  <AuthProviderButton
                    logoUrl={azureAdLogoUrl}
                    logoHeight="45px"
                    provider="azureactivedirectory"
                    providerName={AzureProviderName}
                    mode="signUp"
                    onAccept={this.handleOnAccept('azureactivedirectory')}
                    disabled={!privacyChecksAccepted}
                  />
                </FeatureFlag>
                <FeatureFlag name="franceconnect_login">
                  <FranceConnectButton
                    role="button"
                    onClick={this.handleOnAccept('franceconnect')}
                    disabled={!privacyChecksAccepted}
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
                    logoUrl={googleLogo}
                    logoHeight="29px"
                    provider="google"
                    providerName="Google"
                    mode="signUp"
                    onAccept={this.handleOnAccept('google')}
                    disabled={!privacyChecksAccepted}
                  />
                </FeatureFlag>
                <FeatureFlag name="facebook_login">
                  <AuthProviderButton
                    logoUrl={facebookLogo}
                    logoHeight="21px"
                    provider="facebook"
                    providerName="Facebook"
                    mode="signUp"
                    onAccept={this.handleOnAccept('facebook')}
                    disabled={!privacyChecksAccepted}

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
