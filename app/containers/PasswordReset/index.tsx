import React from 'react';
import { adopt } from 'react-adopt';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// router
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';

// components
import { Success } from 'cl2-component-library';
import Button from 'components/UI/Button';
import PasswordInput, {
  hasPasswordMinimumLength,
} from 'components/UI/PasswordInput';
import PasswordIconTooltip from 'components/UI/PasswordInput/PasswordInputIconTooltip';
import { Helmet } from 'react-helmet';
import ContentContainer from 'components/ContentContainer';
import { FormLabel } from 'components/UI/FormComponents';
import Error from 'components/UI/Error';

// services
import { resetPassword } from 'services/auth';
import { CLError } from 'typings';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import messages from './messages';
import { fontSizes, colors } from 'utils/styleUtils';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

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

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledFormLabel = styled(FormLabel)`
  width: max-content;
  margin-right: 5px;
`;

const StyledPasswordIconTooltip = styled(PasswordIconTooltip)`
  margin-bottom: 6px;
`;

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

  handleOnSubmit = async (event) => {
    const { password, token } = this.state;

    event.preventDefault();

    if (this.validate() && password && token) {
      try {
        this.setState({ processing: true, success: false });
        await resetPassword(password, token);
        this.setState({ password: null, processing: false, success: true });
      } catch (errors) {
        const apiErrors = errors.json.errors;
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
    const {
      password,
      processing,
      success,
      apiErrors,
      minimumLengthError,
    } = this.state;
    const helmetTitle = formatMessage(messages.helmetTitle);
    const helmetDescription = formatMessage(messages.helmetDescription);
    const title = formatMessage(messages.title);
    const passwordPlaceholder = formatMessage(messages.passwordPlaceholder);
    const updatePassword = formatMessage(messages.updatePassword);
    const successMessage = success
      ? formatMessage(messages.successMessage)
      : null;

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
              <LabelContainer>
                <StyledFormLabel
                  labelMessage={messages.passwordLabel}
                  htmlFor="password-reset-input"
                />
                <StyledPasswordIconTooltip />
              </LabelContainer>
              <PasswordInput
                id="password"
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

const PasswordResetWithHocs = injectIntl<Props>(PasswordReset);

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
