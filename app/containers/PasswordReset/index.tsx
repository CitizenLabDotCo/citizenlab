import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { browserHistory } from 'react-router';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Success from 'components/UI/Success';

// services
import { resetPassword } from 'services/auth';

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

const FormElement: any = styled.div`
  width: 100%;
  margin-bottom: 25px;
`;

type Props = {};

type State = {
  token: string | null;
  password: string | null;
  passwordError: boolean;
  submitError: boolean;
  processing: boolean;
  success: boolean;
};

class PasswordReset extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  passwordInputElement: HTMLInputElement | null;

  constructor() {
    super();

    const query = browserHistory.getCurrentLocation().query;
    const token = (query.token ? query.token : null);

    this.state = {
      token,
      password: null,
      passwordError: false,
      submitError: false,
      processing: false,
      success: false
    };

    this.passwordInputElement = null;
  }

  componentDidMount() {
    const { token } = this.state;

    if (!_.isString(token)) {
      browserHistory.push('/');
    } else if (this.passwordInputElement) {
      this.passwordInputElement.focus();
    }
  }

  validate = (password: string | null) => {
    const passwordError = (!password || password.length < 8);

    if (passwordError && this.passwordInputElement) {
      this.passwordInputElement.focus();
    }

    this.setState({ passwordError });

    return (!passwordError);
  }

  handlePasswordOnChange = (value) => {
    this.setState({
      passwordError: false,
      submitError: false,
      password: value
    });
  }

  handlePasswordInputSetRef = (element: HTMLInputElement) => {
    this.passwordInputElement = element;
  }

  handleOnSubmit = async () => {
    const { password, token } = this.state;

    if (this.validate(password) && password && token) {
      try {
        this.setState({ processing: true });
        await resetPassword(password, token);
        this.setState({ processing: false, success: true });
        setTimeout(() => this.setState({ success: false }), 8000);
      } catch {
        this.setState({ processing: false, success: false, submitError: true });
      }
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { password, passwordError, submitError, processing, success } = this.state;
    const passwordPlaceholder = formatMessage(messages.passwordPlaceholder);
    const updatePassword = formatMessage(messages.updatePassword);
    const successMessage = (success ? formatMessage(messages.successMessage) : null);
    let errorMessage: string | null = null;

    if (passwordError) {
      errorMessage = formatMessage(messages.passwordError);
    } else if (submitError) {
      errorMessage = formatMessage(messages.submitError);
    }

    return (
      <Container>
        <Form>
          <Title>{formatMessage(messages.title)}</Title>

            <Input
              type="password"
              id="password"
              value={password}
              placeholder={passwordPlaceholder}
              onChange={this.handlePasswordOnChange}
              setRef={this.handlePasswordInputSetRef}
            />

            <Button
              size="2"
              loading={processing}
              text={updatePassword}
              onClick={this.handleOnSubmit}
            />

            <Error text={errorMessage} />

            <Success text={successMessage} />
        </Form>
      </Container>
    );
  }
}

export default injectIntl<Props>(PasswordReset);
