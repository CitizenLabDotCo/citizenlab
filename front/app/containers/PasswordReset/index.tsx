import React, { FormEvent } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { PasswordResetSuccess } from 'containers/PasswordReset/PasswordResetSuccess';
import { isString } from 'lodash-es';
import { parse } from 'qs';
import { adopt } from 'react-adopt';
import { Helmet } from 'react-helmet';
import { WrappedComponentProps } from 'react-intl';

// style

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import { CLError } from 'typings';

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

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import resetPassword from 'api/authentication/reset_password/resetPassword';

import messages from './messages';

interface DataProps {
  tenant: GetAppConfigurationChildProps;
}

interface InputProps {}

interface Props extends InputProps, DataProps {}

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

class PasswordReset extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  passwordInputElement: HTMLInputElement | null;

  constructor(props: Props & WrappedComponentProps) {
    super(props);
    const query = parse(clHistory.location.search, { ignoreQueryPrefix: true });
    const token = isString(query.token) ? query.token : null;
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

    if (!isString(token)) {
      clHistory.push('/');
    } else if (this.passwordInputElement) {
      this.passwordInputElement.focus();
    }
  }

  hasPasswordMinimumLengthError = () => {
    const { tenant } = this.props;
    const { password } = this.state;

    return typeof password === 'string'
      ? hasPasswordMinimumLength(
          password,
          !isNilOrError(tenant)
            ? tenant.attributes.settings.password_login?.minimum_length
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
    const { formatMessage } = this.props.intl;
    const { password, processing, success, apiErrors, minimumLengthError } =
      this.state;
    const helmetTitle = formatMessage(messages.helmetTitle);
    const helmetDescription = formatMessage(messages.helmetDescription);
    const title = formatMessage(messages.title);
    const passwordPlaceholder = formatMessage(messages.passwordPlaceholder);
    const updatePassword = formatMessage(messages.updatePassword);

    return success ? (
      <PasswordResetSuccess />
    ) : (
      <Box
        width="100%"
        minHeight={`calc(100vh - ${
          stylingConsts.menuHeight + stylingConsts.footerHeight
        }px)`}
      >
        <Helmet
          title={helmetTitle}
          meta={[{ name: 'description', content: helmetDescription }]}
        />

        <main>
          <StyledContentContainer>
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
                Object.keys(apiErrors).map((errorField: ApiErrorFieldName) => (
                  <Error
                    key={errorField}
                    apiErrors={apiErrors[errorField]}
                    fieldName={errorField}
                  />
                ))}

              <StyledButton
                size="m"
                processing={processing}
                text={updatePassword}
                onClick={this.handleOnSubmit}
              />
            </Form>
          </StyledContentContainer>
        </main>
      </Box>
    );
  }
}

const PasswordResetWithHocs = injectIntl(PasswordReset);

const Data = adopt({
  tenant: <GetAppConfiguration />,
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps: DataProps) => (
      <PasswordResetWithHocs {...inputProps} {...dataProps} />
    )}
  </Data>
);
