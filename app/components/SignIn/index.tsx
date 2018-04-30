import React from 'react';
import { get, isFunction } from 'lodash';
import { Subscription } from 'rxjs/Rx';

// libraries
import { browserHistory, Link } from 'react-router';
import { Location } from 'history';

// components
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import FeatureFlag from 'components/FeatureFlag';

// services
import { signIn } from 'services/auth';
import { currentTenantStream, ITenant } from 'services/tenant';
import { globalState, IIdeasNewPageGlobalState } from 'services/globalState';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isValidEmail } from 'utils/validate';
import { AUTH_PATH } from 'containers/App/constants';

// style
import { darken } from 'polished';
import styled, { css } from 'styled-components';
import { color } from 'utils/styleUtils';

// logos
const googleLogo = require('components/SignUp/google.svg') as string;
const facebookLogo = require('components/SignUp/facebook.svg') as string;

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 34px;
  line-height: 42px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 35px;
`;

const Form = styled.form`
  width: 100%;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 15px;
  position: relative;
`;

const PasswordInput = styled(Input)`
  input {
    padding-right: 100px;
  }
`;

const ForgotPassword = styled(Link)`
  color: ${color('label')};
  color: #999;
  font-size: 14px;
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

const CreateAnAccountStyle = css`
  color: ${(props) => props.theme.colorMain};
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  margin-left: 15px;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
  }
`;

const CreateAnAccountDiv = styled.div`
  ${CreateAnAccountStyle}
`;

const CreateAnAccountLink = styled(Link)`
  ${CreateAnAccountStyle}
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

const SocialLoginText = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 16px;
  font-weight: 300;
  line-height: 20px;
  margin-left: 4px;
  margin-bottom: 20px;
`;

const SocialLoginButtons = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SocialSignInButton = styled.div`
  width: 100%;
  height: 58px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 5px;
  border: solid 1px #e4e4e4;
  user-select: none;
  cursor: pointer;
  position: relative;

  &.google:hover,
  &.google.active {
    border-color: #2a81f4;
  }

  &.facebook:hover,
  &.facebook.active {
    border-color: #345697;
  }
`;

type Props = {
  onSignedIn: (userId: string) => void;
  title?: string | JSX.Element;
  goToSignUpForm?: () => void;
};

type State = {
  location: Location | null;
  currentTenant: ITenant | null;
  email: string | null;
  password: string | null;
  processing: boolean;
  emailError: string | null;
  passwordError: string | null;
  signInError: string | null;
  socialLoginUrlParameter: string;
  loading: boolean;
};

class SignIn extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Subscription[];
  emailInputElement: HTMLInputElement | null;
  passwordInputElement: HTMLInputElement | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      location: browserHistory.getCurrentLocation(),
      currentTenant: null,
      email: null,
      password: null,
      processing: false,
      emailError: null,
      passwordError: null,
      signInError: null,
      socialLoginUrlParameter: '',
      loading: true
    };
    this.subscriptions = [];
    this.emailInputElement = null;
    this.passwordInputElement = null;
  }

  componentDidMount() {
    const globalState$ = globalState.init<IIdeasNewPageGlobalState>('IdeasNewPage').observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({ currentTenant, loading: false });
      }),

      globalState$.subscribe((globalState) => {
        this.setState({ socialLoginUrlParameter: (globalState && globalState.ideaId ? `?idea_to_publish=${globalState.ideaId}` : '') });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmailOnChange = (email) => {
    this.setState({ email, emailError: null, signInError: null });
  }

  handlePasswordOnChange = (password) => {
    this.setState({ password, passwordError: null, signInError: null });
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

  handleOnSubmit = async (event: React.FormEvent<any>) => {
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

  goToSignUpForm = (event) => {
    event.preventDefault();

    if (isFunction(this.props.goToSignUpForm)) {
      this.props.goToSignUpForm();
    }
  }

  handleOnSSOClick = (provider) => () => {
    window.location.href = `${AUTH_PATH}/${provider}${this.state.socialLoginUrlParameter}`;
  }

  render() {
    const { title } = this.props;
    const { formatMessage } = this.props.intl;
    const { location, currentTenant, email, password, processing, emailError, passwordError, signInError, loading } = this.state;
    const googleLoginEnabled = !!get(currentTenant, `data.attributes.settings.google_login.enabled`);
    const facebookLoginEnabled = !!get(currentTenant, `data.attributes.settings.facebook_login.enabled`);
    const showSocialLogin = (googleLoginEnabled || facebookLoginEnabled);

    const createAccount = ((location && location.pathname.endsWith('/ideas/new')) ? (
      <CreateAnAccountDiv onClick={this.goToSignUpForm}>
        <FormattedMessage {...messages.createAnAccount} />
      </CreateAnAccountDiv>
    ) : (
      <CreateAnAccountLink to="/sign-up">
        <FormattedMessage {...messages.createAnAccount} />
      </CreateAnAccountLink>
    ));

    if (!loading) {
      return (
        <Container>
          <Title>{title || <FormattedMessage {...messages.title} />}</Title>

          <Form id="signin" onSubmit={this.handleOnSubmit} noValidate={true}>
            <FormElement>
              <Input
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
                type="password"
                id="password"
                value={password}
                placeholder={formatMessage(messages.passwordPlaceholder)}
                error={passwordError}
                onChange={this.handlePasswordOnChange}
                setRef={this.handlePasswordInputSetRef}
              />
              <ForgotPassword to="/password-recovery">
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
                  circularCorners={true}
                />
                {createAccount}
              </ButtonWrapper>
              <Error marginTop="10px" text={signInError} />
            </FormElement>

            {showSocialLogin &&
              <div>
                <Separator />

                <Footer>
                  <SocialLoginText>
                    {formatMessage(messages.orLogInWith)}
                  </SocialLoginText>
                  <SocialLoginButtons>
                    <FeatureFlag name="google_login">
                      <SocialSignInButton className="google" onClick={this.handleOnSSOClick('google')}>
                        <img src={googleLogo} height="29px" role="presentation" alt="" />
                      </SocialSignInButton>
                    </FeatureFlag>
                    <FeatureFlag name="facebook_login">
                      <SocialSignInButton className="facebook" onClick={this.handleOnSSOClick('facebook')}>
                        <img src={facebookLogo} height="21px" role="presentation" alt="" />
                      </SocialSignInButton>
                    </FeatureFlag>
                  </SocialLoginButtons>
                </Footer>
              </div>
            }
          </Form>
        </Container>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(SignIn);
