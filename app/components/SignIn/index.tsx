import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { Link } from 'react-router';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// services
import { signIn } from 'services/auth';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// utils
import { isValidEmail } from 'utils/validate';

// style
import { darken } from 'polished';
import styled from 'styled-components';

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
  color: ${props => props.theme.colors.label};
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
`;

const CreateAnAccount = styled(Link)`
  color: ${(props) => props.theme.colorMain};
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;

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
  justify-content: center;
`;

const FooterText = styled.div`
  color: #888;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  margin-top: 5px;
  margin-bottom: 0px;

  span {
    margin-right: 7px;
  }
`;

const FooterLink = styled.span`
  color: ${(props) => props.theme.colorMain};

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
    cursor: pointer;
  }
`;

const SocialLogin = styled(Button)`
  .Button {
    background: #fff !important;
    border: solid 1px #eaeaea !important;
  }
`;

const GoogleLogin = SocialLogin.extend`
  .Button {
    color: #518EF8 !important;
  }
`;

const FacebookLogin = SocialLogin.extend`
  .Button {
    color: #4B6696 !important;
  }
`;

type Props = {
  onSignedIn: () => void;
  goToSignUpForm?: () => void;
};

type State = {
  email: string | null;
  password: string | null;
  processing: boolean;
  emailError: string | null;
  passwordError: string | null;
  signInError: string | null;
};

class SignIn extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  emailInputElement: HTMLInputElement | null;
  passwordInputElement: HTMLInputElement | null;

  constructor() {
    super();
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

  componentDidMount() {
    this.emailInputElement && this.emailInputElement.focus();
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
        await signIn(email, password);
        this.setState({ processing: false });
        onSignedIn();
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

    if (_.isFunction(this.props.goToSignUpForm)) {
      this.props.goToSignUpForm();
    }
  }

  render() {
    const { intl } = this.props;
    const { formatMessage } = this.props.intl;
    const { email, password, processing, emailError, passwordError, signInError } = this.state;
    const timeout = 500;

    return (
      <Container>
        <Form id="signin" onSubmit={this.handleOnSubmit} noValidate={true}>
          <FormElement>
            {/* <Label value={formatMessage(messages.emailLabel)} htmlFor="email" /> */}
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
            {/* <Label value={formatMessage(messages.passwordLabel)} htmlFor="password" /> */}
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
                size="2"
                loading={processing}
                text={formatMessage(messages.submit)}
                circularCorners={true}
              />

              <CreateAnAccount to="/sign-up">
                <FormattedMessage {...messages.createAnAccount} />
              </CreateAnAccount>
            </ButtonWrapper>
            <Error marginTop="10px" text={signInError} />
          </FormElement>

          <Separator />

          <Footer>
            <GoogleLogin
              text="Google"
              style="primary"
              size="1"
              icon="google-colored"
              linkTo="/ideas/new"
              circularCorners={true}
            />
            <FacebookLogin
              text="Facebook"
              style="primary"
              size="1"
              icon="facebook-blue"
              linkTo="/ideas/new"
              circularCorners={true}
            />
          </Footer>
        </Form>
      </Container>
    );
  }
}

export default injectIntl<Props>(SignIn);
