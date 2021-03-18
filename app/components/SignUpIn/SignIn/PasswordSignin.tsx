import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// libraries
import Link from 'utils/cl-router/Link';

// components
import { Input } from 'cl2-component-library';
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
import { isValidEmail } from 'utils/validate';
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
  emailError: string | null;
  signInError: string | null;
  hasEmptyPasswordError: boolean;
};

class PasswordSignin extends PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
  emailInputElement: HTMLInputElement | null;
  passwordInputElement: HTMLInputElement | null;

  constructor(props) {
    super(props);
    this.state = {
      email: null,
      password: null,
      processing: false,
      emailError: null,
      signInError: null,
      hasEmptyPasswordError: false,
    };
    this.emailInputElement = null;
    this.passwordInputElement = null;
  }

  handleEmailOnChange = (email: string) => {
    this.setState({
      email,
      emailError: null,
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

  validate(email: string | null) {
    const {
      intl: { formatMessage },
      tenant,
    } = this.props;
    const { password } = this.state;
    const phone =
      !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;
    const hasEmailError = !phone && (!email || !isValidEmail(email));
    const emailError = hasEmailError
      ? !email
        ? formatMessage(messages.noEmailError)
        : formatMessage(messages.noValidEmailError)
      : null;
    const hasEmptyPasswordError = !password;

    this.setState({ emailError, hasEmptyPasswordError });

    if (emailError && this.emailInputElement) {
      this.emailInputElement.focus();
    }

    if (!emailError && hasEmptyPasswordError && this.passwordInputElement) {
      this.passwordInputElement.focus();
    }

    return !emailError && !hasEmptyPasswordError;
  }

  handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const { onSignInCompleted } = this.props;
    const { formatMessage } = this.props.intl;
    const { email, password } = this.state;

    if (this.validate(email) && email && password) {
      try {
        this.setState({ processing: true });
        const user = await signIn(email, password);
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
      emailError,
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
    const phone =
      !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;
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
        <Form id="signin" onSubmit={this.handleOnSubmit} noValidate={true}>
          <FormElement>
            <FormLabel
              htmlFor="email"
              labelMessage={
                phone ? messages.emailOrPhoneLabel : messages.emailLabel
              }
            />
            <Input
              type="email"
              id="email"
              value={email}
              error={emailError}
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
                onClick={this.handleOnSubmit}
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

const PasswordSigninWithHoC = withRouter<Props>(injectIntl(PasswordSignin));

const Data = adopt<DataProps, {}>({
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
    {(dataProps) => <PasswordSigninWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
