import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';

// libraries
import Link from 'utils/cl-router/Link';

// components
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import FeatureFlag from 'components/FeatureFlag';
import AuthProviderButton, { Providers } from 'components/AuthProviderButton';

// resources
import GetFeatureFlag from 'resources/GetFeatureFlag';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// services
import { signIn } from 'services/auth';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isValidEmail } from 'utils/validate';
import { AUTH_PATH } from 'containers/App/constants';

// style
import { darken } from 'polished';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// logos
const googleLogo = require('components/AuthProviderButton/svg/google.svg') as string;
const facebookLogo = require('components/AuthProviderButton/svg/facebook.svg') as string;
const franceconnectLogo = require('components/AuthProviderButton/svg/franceconnect.svg') as string;

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  width: 100%;
  color: #333;
  font-size: ${fontSizes.xxxxl}px;
  line-height: 42px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 35px;
`;

const Form = styled.form`
  width: 100%;
`;

const PasswordLogin = styled.div``;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 15px;
  position: relative;
`;

const StyledInput = styled(Input)`
  input {
    &::placeholder {
      color: ${colors.label};
    }

    &:focus::placeholder {
      color: #aaa;
    }
  }
`;

const PasswordInput = styled(StyledInput)`
  input {
    padding-right: 100px;
  }
`;

const ForgotPassword = styled(Link)`
  color: ${colors.label};
  color: #999;
  font-size: ${fontSizes.small}px;
  line-height: 18px;
  font-weight: 300;
  text-decoration: none;
  cursor: pointer;
  position: absolute;
  right: 16px;
  top: 16px;

  &:hover {
    color: #000;
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
`;

const CreateAnAccountLink = styled(Link)`
  color: ${(props) => props.theme.colorMain};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  margin-left: 15px;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
  }
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: transparent;
  border-bottom: solid 1px #ccc;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const CreateAccount = styled.div`
  margin-top: 10px;
  margin-left: -15px;
`;

const SocialLoginText = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: 20px;
  margin-left: 4px;
  margin-bottom: 5px;
`;

const AuthProviderButtons = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const FranceConnectButton = styled.div`
  cursor: pointer;
  margin-top: 10px;
`;

const SubSocialButtonLink = styled.a`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  text-decoration: none;
  padding-top: 0.2em;
`;

interface InputProps {
  onSignedIn: (userId: string) => void;
  title?: string | JSX.Element;
  className?: string;
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

type State = {
  email: string | null;
  password: string | null;
  processing: boolean;
  emailError: string | null;
  passwordError: string | null;
  signInError: string | null;
};

class SignIn extends PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  emailInputElement: HTMLInputElement | null;
  passwordInputElement: HTMLInputElement | null;

  constructor(props) {
    super(props);
    this.state = {
      email: null,
      password: null,
      processing: false,
      emailError: null,
      passwordError: null,
      signInError: null
    };
    this.emailInputElement = null;
    this.passwordInputElement = null;
  }

  handleEmailOnChange = (email: string) => {
    this.setState({
      email,
      emailError: null,
      signInError: null
    });
  }

  handlePasswordOnChange = (password: string) => {
    this.setState({
      password,
      passwordError: null,
      signInError: null
    });
  }

  validate(email: string | null, password: string | null) {
    const { formatMessage } = this.props.intl;
    const hasEmailError = (!email || !isValidEmail(email));
    const emailError = (hasEmailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const passwordError = (!password ? formatMessage(messages.noPasswordError) : null);

    this.setState({ emailError, passwordError });

    if (emailError && this.emailInputElement) {
      this.emailInputElement.focus();
    }

    if (passwordError && this.passwordInputElement) {
      this.passwordInputElement.focus();
    }

    return (!emailError && !passwordError);
  }

  handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const { onSignedIn } = this.props;
    const { formatMessage } = this.props.intl;
    const { email, password } = this.state;

    if (this.validate(email, password) && email && password) {
      try {
        this.setState({ processing: true });
        const user = await signIn(email, password);
        this.setState({ processing: false });
        onSignedIn(user.data.id);
      } catch (error) {
        const signInError = formatMessage(messages.signInError);
        this.setState({ signInError, processing: false });
      }
    }
  }

  handleEmailInputSetRef = (element: HTMLInputElement) => {
    if (element) {
      this.emailInputElement = element;
      this.emailInputElement.focus();
    }
  }

  handlePasswordInputSetRef = (element: HTMLInputElement) => {
    this.passwordInputElement = element;
  }

  handleOnSSOClick = (provider: Providers) => () => {
    window.location.href = `${AUTH_PATH}/${provider}`;
  }

  render() {
    const { email, password, processing, emailError, passwordError, signInError } = this.state;
    const { className, title, tenant, passwordLoginEnabled, googleLoginEnabled, facebookLoginEnabled, azureAdLoginEnabled, franceconnectLoginEnabled } = this.props;
    const { formatMessage } = this.props.intl;
    const externalLoginEnabled = (googleLoginEnabled || facebookLoginEnabled || azureAdLoginEnabled || franceconnectLoginEnabled);
    const azureAdLogo: string | null = get(tenant, 'data.attributes.settings.azure_ad_login.logo_url', null);
    const tenantLoginMechanismName: string | null = get(tenant, 'data.attributes.settings.azure_ad_login.login_mechanism_name', null);

    return (
      <Container className={`e2e-sign-in-container ${className}`}>
        <Title>{title || <FormattedMessage {...messages.title} />}</Title>

        <Form id="signin" onSubmit={this.handleOnSubmit} noValidate={true}>
          {passwordLoginEnabled &&
            <PasswordLogin>
              <FormElement>
                <StyledInput
                  ariaLabel={formatMessage(messages.emailPlaceholder)}
                  type="email"
                  id="email"
                  value={email}
                  placeholder={formatMessage(messages.emailPlaceholder)}
                  error={emailError}
                  onChange={this.handleEmailOnChange}
                  setRef={this.handleEmailInputSetRef}
                />
              </FormElement>

              <FormElement>
                <PasswordInput
                  ariaLabel={formatMessage(messages.passwordPlaceholder)}
                  type="password"
                  id="password"
                  value={password}
                  placeholder={formatMessage(messages.passwordPlaceholder)}
                  error={passwordError}
                  onChange={this.handlePasswordOnChange}
                  setRef={this.handlePasswordInputSetRef}
                />
                <ForgotPassword to="/password-recovery" className="e2e-password-recovery-link">
                  <FormattedMessage {...messages.forgotPassword} />
                </ForgotPassword>
              </FormElement>

              <FormElement>
                <ButtonWrapper>
                  <Button
                    onClick={this.handleOnSubmit}
                    size="1"
                    processing={processing}
                    text={formatMessage(messages.submit)}
                    className="e2e-submit-signin"
                  />
                  <CreateAnAccountLink to="/sign-up" className="e2e-sign-up-link">
                    <FormattedMessage {...messages.createAnAccount} />
                  </CreateAnAccountLink>
                </ButtonWrapper>
                <Error marginTop="10px" text={signInError} />
              </FormElement>
            </PasswordLogin>
          }

          {passwordLoginEnabled && externalLoginEnabled &&
            <Separator />
          }

          {externalLoginEnabled &&
            <Footer>
              {(passwordLoginEnabled &&
                <SocialLoginText>
                  {formatMessage(messages.orLogInWith)}
                </SocialLoginText>
              )}
              <AuthProviderButtons>
                <FeatureFlag name="azure_ad_login">
                  {azureAdLogo && tenantLoginMechanismName &&
                    <AuthProviderButton
                      logoUrl={azureAdLogo}
                      logoHeight="45px"
                      provider="azureactivedirectory"
                      providerName={tenantLoginMechanismName}
                      onAccept={this.handleOnSSOClick('azureactivedirectory')}
                      acceptText={messages.alreadyAcceptTermsAndConditions}
                      altText={messages.signInButtonAltText}
                    />
                  }
                </FeatureFlag>

                <FeatureFlag name="franceconnect_login">
                  <FranceConnectButton role="button" onClick={this.handleOnSSOClick('franceconnect')}>
                    <img
                      src={franceconnectLogo}
                      alt={this.props.intl.formatMessage(messages.signInButtonAltText, { loginMechanismName: 'FranceConnect' })}
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
                    onAccept={this.handleOnSSOClick('google')}
                    acceptText={messages.alreadyAcceptTermsAndConditions}
                    altText={messages.signInButtonAltText}
                  />
                </FeatureFlag>
                <FeatureFlag name="facebook_login">
                  <AuthProviderButton
                    logoUrl={facebookLogo}
                    logoHeight="21px"
                    provider="facebook"
                    providerName="Facebook"
                    onAccept={this.handleOnSSOClick('facebook')}
                    acceptText={messages.alreadyAcceptTermsAndConditions}
                    altText={messages.signInButtonAltText}
                  />
                </FeatureFlag>
              </AuthProviderButtons>

              {!passwordLoginEnabled &&
                <CreateAccount>
                  <CreateAnAccountLink to="/sign-up" className="e2e-sign-up-link">
                    <FormattedMessage {...messages.createAnAccount} />
                  </CreateAnAccountLink>
                </CreateAccount>
              }
            </Footer>
          }
        </Form>
      </Container>
    );
  }
}

const SignInWithInjectedIntl = withRouter<Props>(injectIntl(SignIn));

const Data = adopt<DataProps, {}>({
  tenant: <GetTenant />,
  passwordLoginEnabled: <GetFeatureFlag name="password_login" />,
  googleLoginEnabled: <GetFeatureFlag name="google_login" />,
  facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  azureAdLoginEnabled: <GetFeatureFlag name="azure_ad_login" />,
  franceconnectLoginEnabled: <GetFeatureFlag name="franceconnect_login" />,
});

export default (inputProps: InputProps) => (
  <Data>
    {dataProps => <SignInWithInjectedIntl {...inputProps} {...dataProps} />}
  </Data>
);
