import React from 'react';
import { isString } from 'lodash-es';

// router
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';

// components
import { Input, Success } from 'cl2-component-library';
import Button from 'components/UI/Button';
import { Helmet } from 'react-helmet';
import ContentContainer from 'components/ContentContainer';
import { FormLabel } from 'components/UI/FormComponents';
import Error from 'components/UI/Error';

// services
import { resetPassword } from 'services/auth';
import { CLError } from 'typings';
import { addErrorPayload } from 'utils/errorUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import messages from './messages';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  background: ${colors.background};
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 100px;
`;

const Title = styled.h1`
  width: 100%;
  color: #333;
  font-size: ${fontSizes.xxxxl}px;
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

interface IApiErrors {
  token?: CLError[];
  password?: CLError[];
}

type State = {
  token: string | null;
  password: string | null;
  passwordError: boolean;
  submitError: boolean;
  processing: boolean;
  success: boolean;
  apiErrors: IApiErrors | null;
};

class PasswordReset extends React.PureComponent<
  Props & InjectedIntlProps,
  State
> {
  passwordInputElement: HTMLInputElement | null;

  constructor(props) {
    super(props);
    const query = clHistory.getCurrentLocation().query;
    const token = isString(query.token) ? query.token : null;
    this.state = {
      token,
      password: null,
      passwordError: false,
      submitError: false,
      processing: false,
      success: false,
      apiErrors: null,
    };

    this.passwordInputElement = null;
  }

  componentDidMount() {
    const { token } = this.state;

    if (!isString(token)) {
      clHistory.push('/');
    } else if (this.passwordInputElement) {
      this.passwordInputElement.focus();
    }
  }

  validate = (password: string | null) => {
    const passwordError = !password || password.length < 8;

    if (passwordError && this.passwordInputElement) {
      this.passwordInputElement.focus();
    }

    this.setState({ passwordError });

    return !passwordError;
  };

  handlePasswordOnChange = (value) => {
    this.setState({
      passwordError: false,
      submitError: false,
      apiErrors: null,
      password: value,
    });
  };

  handlePasswordInputSetRef = (element: HTMLInputElement) => {
    this.passwordInputElement = element;
  };

  handleOnSubmit = async (event) => {
    const { password, token } = this.state;

    event.preventDefault();

    if (this.validate(password) && password && token) {
      try {
        this.setState({ processing: true, success: false });
        await resetPassword(password, token);
        this.setState({ password: null, processing: false, success: true });
      } catch (error) {
        let { errors } = error.json;
        const passwordResetLink = (
          <Link to="/password-recovery">
            <FormattedMessage {...messages.requestNewPasswordReset} />
          </Link>
        );

        errors = addErrorPayload(errors, 'token', 'invalid', {
          passwordResetLink,
        });

        this.setState({
          processing: false,
          success: false,
          submitError: true,
          apiErrors: errors,
        });
      }
    }
  };

  render() {
    const { formatMessage } = this.props.intl;
    const {
      password,
      passwordError,
      processing,
      success,
      apiErrors,
    } = this.state;
    const helmetTitle = formatMessage(messages.helmetTitle);
    const helmetDescription = formatMessage(messages.helmetDescription);
    const title = formatMessage(messages.title);
    const passwordPlaceholder = formatMessage(messages.passwordPlaceholder);
    const updatePassword = formatMessage(messages.updatePassword);
    const successMessage = success
      ? formatMessage(messages.successMessage)
      : null;
    let errorMessage: string | null = null;

    if (passwordError) {
      errorMessage = formatMessage(messages.passwordError);
    }

    return (
      <Container>
        <Helmet
          title={helmetTitle}
          meta={[{ name: 'description', content: helmetDescription }]}
        />

        <main>
          <StyledContentContainer>
            <Title>{title}</Title>

            <Form onSubmit={this.handleOnSubmit}>
              <FormLabel
                htmlFor="password"
                labelMessage={messages.passwordLabel}
              />
              <StyledInput
                type="password"
                id="password"
                value={password}
                error={errorMessage}
                placeholder={passwordPlaceholder}
                onChange={this.handlePasswordOnChange}
                setRef={this.handlePasswordInputSetRef}
              />
              {apiErrors &&
                Object.keys(apiErrors).map((errorField) => (
                  <Error
                    key={errorField}
                    apiErrors={apiErrors[errorField]}
                    fieldName={errorField}
                  />
                ))}

              <StyledButton
                size="2"
                processing={processing}
                text={updatePassword}
                onClick={this.handleOnSubmit}
              />

              <Success text={successMessage} />
            </Form>
          </StyledContentContainer>
        </main>
      </Container>
    );
  }
}

export default injectIntl<Props>(PasswordReset);
