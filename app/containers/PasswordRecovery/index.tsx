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

type Props = {};

type State = {
  email: string | null;
  emailError: boolean;
  submitError: boolean;
  processing: boolean;
  success: boolean;
};

class PasswordRecovery extends React.PureComponent<Props & InjectedIntlProps, State> {
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

  handleEmailOnChange = (value) => {
    this.setState({
      emailError: false,
      submitError: false,
      email: value
    });
  }

  handleEmailInputSetRef = (element: HTMLInputElement) => {
    this.emailInputElement = element;
  }

  handleOnSubmit = async () => {
    const { email } = this.state;

    if (this.validate(email) && email) {
      try {
        this.setState({ processing: true });
        await sendPasswordResetMail(email);
        this.setState({ success: true });
        setTimeout(() => this.setState({ processing: false, success: false }), 8000);
      } catch {
        this.setState({ processing: false, success: false, submitError: true });
      }
    } else {
      this.setState({ emailError: true });
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { email, emailError, submitError, processing, success } = this.state;
    const emailPlaceholder = formatMessage(messages.emailPlaceholder);
    const resetPassword = formatMessage(messages.resetPassword);
    const successMessage = (success ? formatMessage(messages.successMessage) : null);
    let errorMessage: string | null = null;

    if (emailError) {
      errorMessage = formatMessage(messages.emailError);
    } else if (submitError) {
      errorMessage = formatMessage(messages.submitError);
    }

    return (
      <Container>
        <Form>
          <Title>{formatMessage(messages.title)}</Title>

          <Input
            id="email"
            type="text"
            value={email}
            placeholder={emailPlaceholder}
            onChange={this.handleEmailOnChange}
            setRef={this.handleEmailInputSetRef}
          />

          <Button
            size="2"
            loading={processing}
            text={resetPassword}
            onClick={this.handleOnSubmit}
          />

          <Error text={errorMessage} />
          {/* <Error fieldName="title_multiloc" apiErrors={this.state.errors.title_multiloc} /> */}

          <Success text={successMessage} />

        </Form>
      </Container>
    );
  }
}

export default injectIntl<Props>(PasswordRecovery);
