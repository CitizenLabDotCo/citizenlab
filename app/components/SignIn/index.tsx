import * as React from 'react';
import { get, isFunction } from 'lodash';
import * as Rx from 'rxjs/Rx';

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

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
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

const SocialLoginButton = styled(Button)`
  .Button {
    background: #fff !important;
    border: solid 1px #eaeaea !important;
  }

  &:hover {
    .Button {
      border-color: #ccc !important;
    }
  }
`;

const GoogleLogin = SocialLoginButton.extend`
  margin-right: 15px;

  .Button {
    color: #518EF8 !important;
  }
`;

const FacebookLogin = SocialLoginButton.extend`
  .Button {
    color: #4B6696 !important;
  }
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
`;

type Props = {
  onSignedIn: (userId: string) => void;
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
  
  subscriptions: Rx.Subscription[];
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

    this.emailInputElement && this.emailInputElement.focus();

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

    if (emailError) {
      this.emailInputElement && this.emailInputElement.focus();
    } else if (passwordError) {
      this.passwordInputElement && this.passwordInputElement.focus();
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
    this.emailInputElement = element;
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
                      <GoogleLogin
                        text="Google"
                        style="primary"
                        size="1"
                        icon="google-colored"
                        onClick={this.handleOnSSOClick('google')}
                        circularCorners={true}
                      />
                    </FeatureFlag>
                    <FeatureFlag name="facebook_login">
                      <FacebookLogin
                        text="Facebook"
                        style="primary"
                        size="1"
                        icon="facebook-blue"
                        onClick={this.handleOnSSOClick('facebook')}
                        circularCorners={true}
                      />
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
