import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Success from 'components/UI/Success';

// services
import { sendPasswordResetMail } from 'services/auth';

// utils
import { isValidEmail } from 'utils/validate';

// i18n
import { injectIntl, InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import messages from './messages';

const Container = styled.div`
  width: 100%;
`;

const Form = styled.div`
  width: 100%;
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 38px;
  line-height: 44px;
  font-weight: 500;
  text-align: left;
  margin-top: 50px;
  margin-bottom: 35px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 25px;
`;

type Props = {
  onExit?: () => void;
};

export type State = {
  email: string | null;
  emailError: boolean;
  submitError: boolean;
  processing: boolean;
  success: boolean;
};

class PasswordReset extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  emailInputElement: HTMLInputElement | null;

  constructor() {
    super();
    this.state = {
      email: null,
      emailError: false,
      submitError: false,
      processing: false,
      success: false
    };
    this.emailInputElement = null;
  }

  componentDidMount() {
    if (this.emailInputElement) {
      this.emailInputElement.focus();
    }
  }

  validate = (email: string | null) => {
    const emailError = (!email || !isValidEmail(email));

    if (emailError && this.emailInputElement) {
      this.emailInputElement.focus();
    }

    this.setState({ emailError });

    return (!emailError);
  }

  handleEmailOnChange = () => {
    this.setState({ emailError: false });
  }

  handleEmailInputSetRef = (element: HTMLInputElement) => {
    this.emailInputElement = element;
  }

  handleOnSubmit = async () => {
    const { email } = this.state;

    if (this.validate(email) && email) {
      try {
        await sendPasswordResetMail(email);
        this.setState({ success: true });
        setTimeout(() => this.setState({ success: false }), 8000);
      } catch {
        this.setState({ success: false, submitError: true });
      }
    }
  }

  handleOnGoBack = () => {
    if (_.has(this.props, 'onExit') && _.isFunction(this.props.onExit)) {
      this.props.onExit();
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { email, emailError, submitError, processing, success } = this.state;
    const emailErrorMessage = (emailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const submitErrorMessage = (submitError ? formatMessage(messages.submitError) : null);
    const successMessage = (success ? formatMessage(messages.successMessage) : null);

    return (
      <Container>
        <Form>
          <Title>{formatMessage(messages.title)}</Title>

          <FormElement name="titleInput">
            <Label value={formatMessage(messages.emailLabel)} htmlFor="email" />
            <Input
              id="email"
              type="text"
              value={email}
              placeholder={formatMessage(messages.emailPlaceholder)}
              error={emailErrorMessage}
              onChange={this.handleEmailOnChange}
              setRef={this.handleEmailInputSetRef}
            />
          </FormElement>

          <FormElement>
            <Button
              size="2"
              loading={processing}
              text={formatMessage(messages.send)}
              onClick={this.handleOnSubmit}
            />
            <Error text={submitErrorMessage} />
            <Success text={successMessage} />
          </FormElement>
        </Form>
      </Container>
    );
  }
}

export default injectIntl<Props>(PasswordReset);
