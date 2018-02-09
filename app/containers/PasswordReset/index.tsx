import * as React from 'react';
import { isString } from 'lodash';

// router
import { browserHistory } from 'react-router';

// components
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Success from 'components/UI/Success';
import { Helmet } from 'react-helmet';
import ContentContainer from 'components/ContentContainer';

// services
import { resetPassword } from 'services/auth';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';


// style
import styled from 'styled-components';
import messages from './messages';

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  background: #f9f9fa;
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 100px;
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 36px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  margin-bottom: 50px;
`;

const StyledInput = styled(Input)``;

const StyledButton = styled(Button)`
  margin-top: 20px;
  margin-bottom: 10px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 380px;
  padding-left: 20px;
  padding-right: 20px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
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
  passwordInputElement: HTMLInputElement | null;

  constructor(props: Props) {
    super(props as any);

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

    if (!isString(token)) {
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

  handleOnSubmit = async (event) => {
    const { password, token } = this.state;

    event.preventDefault();

    if (this.validate(password) && password && token) {
      try {
        this.setState({ processing: true, success: false });
        await resetPassword(password, token);
        this.setState({ password: null, processing: false, success: true });
        /* setTimeout(() => this.setState({ success: false }), 8000); */
      } catch (error) {
        this.setState({ processing: false, success: false, submitError: true });
      }
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { password, passwordError, submitError, processing, success } = this.state;
    const helmetTitle = formatMessage(messages.helmetTitle);
    const helmetDescription = formatMessage(messages.helmetDescription);
    const title = formatMessage(messages.title);
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
        <Helmet
          title={helmetTitle}
          meta={[
            { name: 'description', content: helmetDescription },
          ]}
        />

        <StyledContentContainer>
          <Title>{title}</Title>

          <Form onSubmit={this.handleOnSubmit}>
            <StyledInput
              type="password"
              id="password"
              value={password}
              error={errorMessage}
              placeholder={passwordPlaceholder}
              onChange={this.handlePasswordOnChange}
              setRef={this.handlePasswordInputSetRef}
            />

            <StyledButton
              size="2"
              processing={processing}
              text={updatePassword}
              onClick={this.handleOnSubmit}
              circularCorners={false}
            />

            <Success text={successMessage} />
          </Form>
        </StyledContentContainer>
      </Container>
    );
  }
}

export default injectIntl<Props>(PasswordReset);
