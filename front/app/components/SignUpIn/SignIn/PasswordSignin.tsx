import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';

// libraries
import Link from 'utils/cl-router/Link';

// components
import { Input } from '@citizenlab/cl2-component-library';
import PasswordInput from 'components/UI/PasswordInput';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import { Options, Option } from 'components/SignUpIn/styles';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// services
import { signIn } from 'services/auth';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import {
  getHasEmailValidationError,
  getHasPhoneNumberValidationError,
} from 'utils/validate';
import { isNilOrError } from 'utils/helperUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/SignUpIn/tracks';

// style
import styled from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  width: 100%;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 16px;
  position: relative;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
`;

export interface InputProps {
  metaData: ISignUpInMetaData;
  onSignInCompleted: (userId: string) => void;
  onGoToSignUp: () => void;
  onGoToLogInOptions: () => void;
  className?: string;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  windowSize: GetWindowSizeChildProps;
  passwordLoginEnabled: boolean | null;
  googleLoginEnabled: boolean | null;
  facebookLoginEnabled: boolean | null;
  azureAdLoginEnabled: boolean | null;
  franceconnectLoginEnabled: boolean | null;
}

interface Props extends InputProps, DataProps {}

type State = {
  email: string | null;
  password: string | null;
  processing: boolean;
  emailOrPhoneNumberError: string | null;
  signInError: string | null;
  hasEmptyPasswordError: boolean;
};

class PasswordSignin extends PureComponent<Props & InjectedIntlProps, State> {
  emailInputElement: HTMLInputElement | null;
  passwordInputElement: HTMLInputElement | null;

  constructor(props) {
    super(props);
    this.state = {
      email: null,
      password: null,
      processing: false,
      emailOrPhoneNumberError: null,
      signInError: null,
      hasEmptyPasswordError: false,
    };
    this.emailInputElement = null;
    this.passwordInputElement = null;
  }

  handleEmailOnChange = (email: string) => {
    this.setState({
      email,
      emailOrPhoneNumberError: null,
      signInError: null,
    });
  };

  componentDidMount() {
    trackEventByName(tracks.signInEmailPasswordEntered);
  }

  componentWillUnmount() {
    trackEventByName(tracks.signInEmailPasswordExited);
  }

  handlePasswordOnChange = (password: string) => {
    this.setState({
      password,
      hasEmptyPasswordError: false,
      signInError: null,
    });
  };

  handleGoToLogInOptions = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.onGoToLogInOptions();
  };

  handleGoToSignUp = (event: React.FormEvent) => {
    event.preventDefault();

    if (this.props.metaData?.inModal || this.props.metaData?.noPushLinks) {
      this.props.onGoToSignUp();
    } else {
      clHistory.push('/sign-up');
    }
  };

  validate(
    phoneLoginEnabled: boolean,
    emailOrPhoneNumber: string | null,
    password: string | null
  ) {
    const {
      intl: { formatMessage },
    } = this.props;
    const hasPhoneNumberValidationError =
      getHasPhoneNumberValidationError(emailOrPhoneNumber);
    const hasEmailValidationError =
      getHasEmailValidationError(emailOrPhoneNumber);

    const hasEmailAndPhoneNumberValidationError = phoneLoginEnabled
      ? hasEmailValidationError && hasPhoneNumberValidationError
      : hasEmailValidationError;
    const hasEmptyPasswordError = password ? password.length === 0 : true;

    this.setState({
      emailOrPhoneNumberError:
        phoneLoginEnabled && hasEmailAndPhoneNumberValidationError
          ? formatMessage(messages.emailOrPhoneNumberError)
          : hasEmailValidationError
          ? formatMessage(messages.emailError)
          : null,
      hasEmptyPasswordError,
    });

    if (hasEmailAndPhoneNumberValidationError && this.emailInputElement) {
      this.emailInputElement.focus();
    }

    if (
      !hasEmailAndPhoneNumberValidationError &&
      hasEmptyPasswordError &&
      this.passwordInputElement
    ) {
      this.passwordInputElement.focus();
    }

    return !hasEmailAndPhoneNumberValidationError && !hasEmptyPasswordError;
  }

  handleOnSubmit =
    (phoneLoginEnabled: boolean) => async (event: React.FormEvent) => {
      event.preventDefault();

      const { onSignInCompleted } = this.props;
      const { formatMessage } = this.props.intl;
      const { email, password } = this.state;

      if (this.validate(phoneLoginEnabled, email, password)) {
        try {
          this.setState({ processing: true });
          const user = await signIn(email as string, password as string);
          trackEventByName(tracks.signInEmailPasswordCompleted);
          onSignInCompleted(user.data.id);
        } catch (error) {
          trackEventByName(tracks.signInEmailPasswordFailed, { error });
          const signInError = formatMessage(messages.signInError);
          this.setState({ signInError, processing: false });
        }
      }
    };

  handleEmailInputSetRef = (element: HTMLInputElement) => {
    if (element) {
      this.emailInputElement = element;
    }
  };

  handlePasswordInputSetRef = (element: HTMLInputElement) => {
    this.passwordInputElement = element;
  };

  render() {
    const {
      email,
      password,
      processing,
      emailOrPhoneNumberError,
      signInError,
      hasEmptyPasswordError,
    } = this.state;
    const {
      className,
      tenant,
      windowSize,
      passwordLoginEnabled,
      googleLoginEnabled,
      facebookLoginEnabled,
      azureAdLoginEnabled,
      franceconnectLoginEnabled,
    } = this.props;
    const { formatMessage } = this.props.intl;
    const phoneLoginEnabled =
      !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone
        ? tenant.attributes.settings.password_login.phone
        : false;
    const enabledProviders = [
      passwordLoginEnabled,
      googleLoginEnabled,
      facebookLoginEnabled,
      azureAdLoginEnabled,
      franceconnectLoginEnabled,
    ].filter((provider) => provider === true);
    const isDesktop = windowSize
      ? windowSize > viewportWidths.largeTablet
      : true;

    return (
      <Container
        id="e2e-sign-in-email-password-container"
        className={className || ''}
      >
        <Form
          id="signin"
          onSubmit={this.handleOnSubmit(phoneLoginEnabled)}
          noValidate={true}
        >
          <FormElement>
            <FormLabel
              htmlFor="email"
              labelMessage={
                phoneLoginEnabled
                  ? messages.emailOrPhoneLabel
                  : messages.emailLabel
              }
            />
            <Input
              type="email"
              id="email"
              value={email}
              error={emailOrPhoneNumberError}
              onChange={this.handleEmailOnChange}
              setRef={this.handleEmailInputSetRef}
              autocomplete="email"
              autoFocus={!!(isDesktop && !this.props.metaData?.noAutofocus)}
            />
          </FormElement>

          <FormElement>
            <FormLabel
              htmlFor="password"
              labelMessage={messages.passwordLabel}
            />
            <PasswordInput
              id="password"
              password={password}
              onChange={this.handlePasswordOnChange}
              setRef={this.handlePasswordInputSetRef}
              autocomplete="current-password"
              isLoginPasswordInput
              errors={{ emptyError: hasEmptyPasswordError }}
            />
          </FormElement>

          <FormElement>
            <ButtonWrapper>
              <Button
                onClick={this.handleOnSubmit(phoneLoginEnabled)}
                processing={processing}
                text={formatMessage(messages.submit)}
                id="e2e-signin-password-submit-button"
              />
            </ButtonWrapper>
            <Error marginTop="10px" text={signInError} />
          </FormElement>
        </Form>

        <Options>
          <Option>
            <Link
              to="/password-recovery"
              className="link e2e-password-recovery-link"
            >
              <FormattedMessage {...messages.forgotPassword2} />
            </Link>
          </Option>
          <Option>
            {enabledProviders.length > 1 ? (
              <button
                id="e2e-login-options"
                onClick={this.handleGoToLogInOptions}
                className="link"
              >
                <FormattedMessage {...messages.backToLoginOptions} />
              </button>
            ) : (
              <FormattedMessage
                {...messages.goToSignUp}
                values={{
                  goToOtherFlowLink: (
                    <button
                      id="e2e-goto-signup"
                      onClick={this.handleGoToSignUp}
                    >
                      {formatMessage(messages.signUp)}
                    </button>
                  ),
                }}
              />
            )}
          </Option>
        </Options>
      </Container>
    );
  }
}

const PasswordSigninWithHoC = injectIntl(PasswordSignin);

const Data = adopt<DataProps>({
  tenant: <GetAppConfiguration />,
  windowSize: <GetWindowSize />,
  passwordLoginEnabled: <GetFeatureFlag name="password_login" />,
  googleLoginEnabled: <GetFeatureFlag name="google_login" />,
  facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  azureAdLoginEnabled: <GetFeatureFlag name="azure_ad_login" />,
  franceconnectLoginEnabled: <GetFeatureFlag name="franceconnect_login" />,
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps: DataProps) => (
      <PasswordSigninWithHoC {...inputProps} {...dataProps} />
    )}
  </Data>
);
