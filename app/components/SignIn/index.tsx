import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// libraries
import Link from 'utils/cl-router/Link';

// components
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import FeatureFlag from 'components/FeatureFlag';
import AuthProviderButton from 'components/AuthProviderButton';
import { FormLabel } from 'components/UI/FormComponents';

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
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// logos
import franceconnectLogo from 'components/AuthProviderButton/svg/franceconnect.svg';
import { handleOnSSOClick } from 'services/singleSignOn';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div`
  flex: 1 1 auto;
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

const PasswordLabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledInput = styled(Input)``;

const PasswordInput = styled(StyledInput)``;

const ForgotPassword = styled(Link)`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 18px;
  font-weight: 300;
  text-decoration: none;
  cursor: pointer;

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

const GoToSignUpButton = styled(Button)``;

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

const FranceConnectButton = styled.button`
  text-align: left;
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-top: 10px;
`;

const SubSocialButtonLink = styled.a`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  text-decoration: none;
  padding-top: 0.2em;
`;

export interface InputProps {
  metaData: ISignUpInMetaData;
  onSignInCompleted: (userId: string) => void;
  onGoToSignUp: () => void;
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
    const { intl: { formatMessage }, tenant } = this.props;
    const phone = !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;
    const hasEmailError = !phone && (!email || !isValidEmail(email));
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

    const { onSignInCompleted } = this.props;
    const { formatMessage } = this.props.intl;
    const { email, password } = this.state;

    if (this.validate(email, password) && email && password) {
      try {
        this.setState({ processing: true });
        const user = await signIn(email, password);
        this.setState({ processing: false });
        onSignInCompleted(user.data.id);
      } catch (error) {
        const signInError = formatMessage(messages.signInError);
        this.setState({ signInError, processing: false });
      }
    }
  }

  handleEmailInputSetRef = (element: HTMLInputElement) => {
    if (element) {
      this.emailInputElement = element;
    }
  }

  handlePasswordInputSetRef = (element: HTMLInputElement) => {
    this.passwordInputElement = element;
  }

  handleOnGoToSignUp = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.onGoToSignUp();
  }

  render() {
    const { email, password, processing, emailError, passwordError, signInError } = this.state;
    const { metaData, className, tenant, passwordLoginEnabled, googleLoginEnabled, facebookLoginEnabled, azureAdLoginEnabled, franceconnectLoginEnabled } = this.props;
    const { formatMessage } = this.props.intl;
    const phone = !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;
    const externalLoginEnabled = googleLoginEnabled || facebookLoginEnabled || azureAdLoginEnabled || franceconnectLoginEnabled;
    const azureAdLogo = !isNilOrError(tenant) && tenant?.attributes?.settings?.azure_ad_login?.logo_url;
    const tenantLoginMechanismName = !isNilOrError(tenant) && tenant?.attributes?.settings?.azure_ad_login?.login_mechanism_name;

    const goToSignUpButton = (
      <GoToSignUpButton
        buttonStyle="text"
        padding="0px"
        onClick={this.handleOnGoToSignUp}
      >
        <FormattedMessage {...messages.createAnAccount} />
      </GoToSignUpButton>
    );

    return (
      <Container className={`e2e-sign-in-container ${className}`}>
        <Title>
          <FormattedMessage {...messages.title} />
        </Title>

        <Form id="signin" onSubmit={this.handleOnSubmit} noValidate={true}>
          {passwordLoginEnabled &&
            <PasswordLogin>
              <FormElement>
                <FormLabel
                  htmlFor="email"
                  labelMessage={phone ? messages.emailOrPhoneLabel : messages.emailLabel}
                  thin
                />
                <StyledInput
                  type="email"
                  id="email"
                  value={email}
                  error={emailError}
                  onChange={this.handleEmailOnChange}
                  setRef={this.handleEmailInputSetRef}
                  autocomplete="email"
                  onGreyBackground
                />
              </FormElement>

              <FormElement>
                <PasswordLabelContainer>
                  <FormLabel
                    htmlFor="password"
                    labelMessage={messages.passwordLabel}
                    thin
                  />
                  <ForgotPassword to="/password-recovery" className="e2e-password-recovery-link">
                    <FormattedMessage {...messages.forgotPassword} />
                  </ForgotPassword>
                </PasswordLabelContainer>
                <PasswordInput
                  type="password"
                  id="password"
                  value={password}
                  error={passwordError}
                  onChange={this.handlePasswordOnChange}
                  setRef={this.handlePasswordInputSetRef}
                  autocomplete="current-password"
                  onGreyBackground
                />
              </FormElement>

              <FormElement>
                <ButtonWrapper>
                  <Button
                    onClick={this.handleOnSubmit}
                    processing={processing}
                    text={formatMessage(messages.submit)}
                    className="e2e-submit-signin"
                  />
                  {goToSignUpButton}
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
              {passwordLoginEnabled &&
                <SocialLoginText>
                  {formatMessage(messages.orLogInWith)}
                </SocialLoginText>
              }

              <AuthProviderButtons>
                <FeatureFlag name="azure_ad_login">
                  {azureAdLogo && tenantLoginMechanismName &&
                    <AuthProviderButton
                      provider="azureactivedirectory"
                      providerName={tenantLoginMechanismName}
                      onAccept={handleOnSSOClick('azureactivedirectory', metaData)}
                      mode="signIn"
                    />
                  }
                </FeatureFlag>

                <FeatureFlag name="franceconnect_login">
                  <FranceConnectButton onClick={handleOnSSOClick('franceconnect', metaData)}>
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
                    provider="google"
                    providerName="Google"
                    onAccept={handleOnSSOClick('google', metaData)}
                    mode="signIn"
                  />
                </FeatureFlag>
                <FeatureFlag name="facebook_login">
                  <AuthProviderButton
                    provider="facebook"
                    providerName="Facebook"
                    onAccept={handleOnSSOClick('facebook', metaData)}
                    mode="signIn"
                  />
                </FeatureFlag>
              </AuthProviderButtons>

              {!passwordLoginEnabled &&
                <CreateAccount>
                  {goToSignUpButton}
                </CreateAccount>
              }
            </Footer>
          }
        </Form>
      </Container>
    );
  }
}

const SignInWithHoC = withRouter<Props>(injectIntl(SignIn));

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
    {dataProps => <SignInWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
