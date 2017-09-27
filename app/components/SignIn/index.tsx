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
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
`;

const ForgotPassword = styled.div`
  color: ${(props) => props.theme.colorMain};
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  cursor: pointer;

  &:hover {
    color: ${(props) => darken(0.2, props.theme.colorMain)};
  }
`;

const Separator = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  position: relative;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const SeparatorLine = styled.div`
  width: 100%;
  height: 1px;
  background: transparent;
  border-bottom: solid 1px #ccc;
`;

const SeparatorTextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const SeparatorText = styled.div`
  width: 54px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;

  span {
    color: #999;
    font-size: 17px;
  }
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FooterText = styled.div`
  color: #888;
  font-size: 17px;
  line-height: 21px;
  font-weight: 400;
  margin-top: 0px;
  margin-bottom: 0px;

  span {
    margin-right: 5px;
  }
`;

const FooterLink = styled.span`
  color: ${(props) => props.theme.colorMain};

  &:hover {
    color: ${(props) => darken(0.2, props.theme.colorMain)};
    cursor: pointer;
  }
`;

type Props = {
  onSignedIn: () => void;
  onForgotPassword?: () => void
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

  handleForgotPasswordOnClick = () => {
    !_.isUndefined(this.props.onForgotPassword) && this.props.onForgotPassword();
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
        <Form onSubmit={this.handleOnSubmit} noValidate={true}>
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
            <Input
              type="password"
              id="password"
              value={password}
              placeholder={formatMessage(messages.passwordPlaceholder)}
              error={passwordError}
              onChange={this.handlePasswordOnChange}
              setRef={this.handlePasswordInputSetRef}
            />
          </FormElement>

          <FormElement>
            <ButtonWrapper>
              <Button
                onClick={this.handleOnSubmit}
                size="3"
                loading={processing}
                text={formatMessage(messages.submit)}
                circularCorners={true}
              />
              <ForgotPassword onClick={this.handleForgotPasswordOnClick}>
                <FormattedMessage {...messages.forgotPassword} />
              </ForgotPassword>
            </ButtonWrapper>
            <Error marginTop="10px" text={signInError} />
          </FormElement>

          <Separator>
            <SeparatorLine />
            <SeparatorTextContainer>
              <SeparatorText>
                <span><FormattedMessage {...messages.or} /></span>
              </SeparatorText>
            </SeparatorTextContainer>
          </Separator>

          <Footer>
            <FooterText>
              <span>{formatMessage(messages.noAccount)}</span>
              <FooterLink onClick={this.goToSignUpForm}>{formatMessage(messages.signUp)}</FooterLink>
            </FooterText>

            {/*
            <Button
              size="3"
              style="secondary-outlined"
              text={formatMessage(messages.createAnAccount)}
              fullWidth={true}
              onClick={this.goToSignUpForm}
              circularCorners={true}
            />
            */}
          </Footer>
        </Form>
      </Container>
    );
  }
}

export default injectIntl<Props>(SignIn);
