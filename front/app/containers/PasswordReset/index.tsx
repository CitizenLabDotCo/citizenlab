import React, { FormEvent } from 'react';

import { parse } from 'qs';
import { Helmet } from 'react-helmet-async';
import { WrappedComponentProps } from 'react-intl';
import { CLError, FormatMessage } from 'typings';

import { IAppConfiguration } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import resetPassword from 'api/authentication/reset_password/resetPassword';

import PasswordResetSuccess from 'containers/PasswordReset/PasswordResetSuccess';

import {
  StyledContentContainer,
  Title,
  StyledButton,
  Form,
  LabelContainer,
  StyledPasswordIconTooltip,
} from 'components/smallForm';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import PasswordInput, {
  hasPasswordMinimumLength,
} from 'components/UI/PasswordInput';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';

import messages from './messages';

interface Props {
  appConfig: IAppConfiguration | undefined;
  formatMessage: FormatMessage;
}

interface IApiErrors {
  token?: CLError[];
  password?: CLError[];
}

type ApiErrorFieldName = keyof IApiErrors;

type State = {
  token: string | null;
  password: string | null;
  minimumLengthError: boolean;
  submitError: boolean;
  processing: boolean;
  success: boolean;
  apiErrors: IApiErrors | null;
};

class PasswordReset extends React.PureComponent<Props, State> {
  passwordInputElement: HTMLInputElement | null;

  constructor(props: Props & WrappedComponentProps) {
    super(props);
    const query = parse(clHistory.location.search, { ignoreQueryPrefix: true });
    const token = typeof query.token === 'string' ? query.token : null;
    this.state = {
      token,
      password: null,
      minimumLengthError: false,
      submitError: false,
      processing: false,
      success: false,
      apiErrors: null,
    };

    this.passwordInputElement = null;
  }

  componentDidMount() {
    const { token } = this.state;

    if (typeof token !== 'string') {
      clHistory.push('/');
    } else if (this.passwordInputElement) {
      this.passwordInputElement.focus();
    }
  }

  hasPasswordMinimumLengthError = () => {
    const { appConfig } = this.props;
    const { password } = this.state;

    return typeof password === 'string'
      ? hasPasswordMinimumLength(
          password,
          appConfig
            ? appConfig.data.attributes.settings.password_login?.minimum_length
            : undefined
        )
      : true;
  };

  validate = () => {
    const minimumLengthError = this.hasPasswordMinimumLengthError();
    this.setState({ minimumLengthError });

    if (this.passwordInputElement && minimumLengthError) {
      this.passwordInputElement.focus();
    }

    return !minimumLengthError;
  };

  handlePasswordOnChange = (password: string) => {
    this.setState({
      password,
      minimumLengthError: false,
      submitError: false,
      apiErrors: null,
    });
  };

  handlePasswordInputSetRef = (element: HTMLInputElement) => {
    this.passwordInputElement = element;
  };

  handleOnSubmit = async (event: FormEvent) => {
    const { password, token } = this.state;

    event.preventDefault();

    if (this.validate() && password && token) {
      try {
        this.setState({ processing: true, success: false });
        await resetPassword({ password, token });
        this.setState({ password: null, processing: false, success: true });
      } catch (errors) {
        const apiErrors = errors.errors;
        const tokenErrors: CLError[] = apiErrors.token;

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (tokenErrors && tokenErrors.length > 0) {
          const invalidTokenErrorIndex = tokenErrors
            .map((tokenError) => tokenError.error)
            .indexOf('invalid');

          // -1 if no element was found
          if (invalidTokenErrorIndex !== -1) {
            const invalidTokenError = tokenErrors[invalidTokenErrorIndex];

            invalidTokenError.payload = {
              passwordResetLink: (
                <Link to="/password-recovery">
                  <FormattedMessage {...messages.requestNewPasswordReset} />
                </Link>
              ),
            };
          }
        }

        if (Object.keys(apiErrors).length > 0) {
          this.passwordInputElement?.focus();
        }

        this.setState({
          apiErrors,
          processing: false,
          success: false,
          submitError: true,
        });
      }
    }
  };

  render() {
    const { formatMessage } = this.props;
    const { password, processing, success, apiErrors, minimumLengthError } =
      this.state;
    const helmetTitle = formatMessage(messages.helmetTitle);
    const helmetDescription = formatMessage(messages.helmetDescription);
    const title = formatMessage(messages.title);
    const passwordPlaceholder = formatMessage(messages.passwordPlaceholder);
    const updatePassword = formatMessage(messages.updatePassword);

    return (
      <>
        <Helmet
          title={helmetTitle}
          meta={[{ name: 'description', content: helmetDescription }]}
        />
        <main>
          <StyledContentContainer>
            {success ? (
              <PasswordResetSuccess />
            ) : (
              <>
                <Title>{title}</Title>

                <Form onSubmit={this.handleOnSubmit}>
                  <LabelContainer>
                    <FormLabel
                      width="max-content"
                      margin-right="5px"
                      labelMessage={messages.passwordLabel}
                      htmlFor="password"
                    />
                    <StyledPasswordIconTooltip />
                  </LabelContainer>
                  <PasswordInput
                    id="password"
                    autocomplete="new-password"
                    password={password}
                    placeholder={passwordPlaceholder}
                    onChange={this.handlePasswordOnChange}
                    setRef={this.handlePasswordInputSetRef}
                    errors={{ minimumLengthError }}
                  />
                  {apiErrors &&
                    Object.keys(apiErrors).map(
                      (errorField: ApiErrorFieldName) => (
                        <Error
                          key={errorField}
                          apiErrors={apiErrors[errorField]}
                          fieldName={errorField}
                        />
                      )
                    )}

                  <StyledButton
                    size="m"
                    processing={processing}
                    text={updatePassword}
                    onClick={this.handleOnSubmit}
                  />
                </Form>
              </>
            )}
          </StyledContentContainer>
        </main>
      </>
    );
  }
}

export default () => {
  const { data: appConfig } = useAppConfiguration();
  const { formatMessage } = useIntl();

  return <PasswordReset appConfig={appConfig} formatMessage={formatMessage} />;
};
