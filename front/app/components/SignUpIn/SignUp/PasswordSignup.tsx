import React, { PureComponent } from 'react';
import { set, keys, difference, get } from 'lodash-es';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';

// components
import { Input } from 'cl2-component-library';
import Button from 'components/UI/Button';
import PasswordInput, {
  hasPasswordMinimumLength,
} from 'components/UI/PasswordInput';
import PasswordInputIconTooltip from 'components/UI/PasswordInput/PasswordInputIconTooltip';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import Consent from 'components/SignUpIn/SignUp/Consent';
import { Options, Option } from 'components/SignUpIn/styles';

// utils
import { isValidEmail } from 'utils/validate';
import { isCLErrorJSON } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

// services
import { signUp } from 'services/auth';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/SignUpIn/tracks';

// style
import styled from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

// typings
import { CLErrorsJSON } from 'typings';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { IUser } from 'services/users';

const Container = styled.div``;

const Form = styled.form`
  width: 100%;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const StyledConsent = styled(Consent)`
  padding-top: 10px;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledFormLabel = styled(FormLabel)`
  width: max-content;
  margin-right: 5px;
`;

const StyledPasswordInputIconTooltip = styled(PasswordInputIconTooltip)`
  margin-bottom: 4px;
`;

type InputProps = {
  metaData: ISignUpInMetaData;
  hasNextStep?: boolean;
  onCompleted: (userId: string) => void;
  onGoToSignIn: () => void;
  onGoBack?: () => void;
  className?: string;
};

interface DataProps {
  locale: GetLocaleChildProps;
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
  token: string | null | undefined;
  firstName: string | null;
  lastName: string | null;
  email: string | null | undefined;
  password: string | null;
  tacAccepted: boolean;
  privacyAccepted: boolean;
  processing: boolean;
  invitationRedeemError: string | null;
  firstNameError: string | null;
  lastNameError: string | null;
  emailError: string | null;
  privacyError: boolean;
  hasMinimumLengthError: boolean;
  tacError: boolean;
  unknownError: string | null;
  apiErrors: CLErrorsJSON | null | Error;
};

class PasswordSignup extends PureComponent<Props & InjectedIntlProps, State> {
  firstNameInputElement: HTMLInputElement | null;
  lastNameInputElement: HTMLInputElement | null;
  emailInputElement: HTMLInputElement | null;
  passwordInputElement: HTMLInputElement | null;

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      token: props.metaData.token,
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      tacAccepted: false,
      privacyAccepted: false,
      processing: false,
      invitationRedeemError: null,
      firstNameError: null,
      lastNameError: null,
      emailError: null,
      hasMinimumLengthError: false,
      tacError: false,
      privacyError: false,
      unknownError: null,
      apiErrors: null,
    };

    this.firstNameInputElement = null;
    this.lastNameInputElement = null;
    this.emailInputElement = null;
    this.passwordInputElement = null;
  }

  componentDidMount() {
    trackEventByName(tracks.signUpEmailPasswordStepEntered);

    const { metaData } = this.props;

    this.setState({ token: metaData?.token });

    if (metaData?.token) {
      request<IUser>(
        `${API_PATH}/users/by_invite/${metaData.token}`,
        null,
        { method: 'GET' },
        null
      ).then((response) => {
        this.setState({
          firstName: response?.data?.attributes?.first_name || null,
          lastName: response?.data?.attributes.last_name || null,
          email: response?.data?.attributes?.email || null,
        });
      });
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillMount() {
    trackEventByName(tracks.signUpEmailPasswordStepExited);
  }

  handleTokenOnChange = (token: string) => {
    this.setState({
      token,
      invitationRedeemError: null,
      unknownError: null,
    });
  };

  handleFirstNameOnChange = (firstName: string) => {
    this.setState((state) => ({
      firstName,
      firstNameError: null,
      unknownError: null,
      apiErrors: state.apiErrors
        ? set(state.apiErrors, 'json.errors.first_name', null)
        : null,
    }));
  };

  handleLastNameOnChange = (lastName: string) => {
    this.setState((state) => ({
      lastName,
      lastNameError: null,
      unknownError: null,
      apiErrors: state.apiErrors
        ? set(state.apiErrors, 'json.errors.last_name', null)
        : null,
    }));
  };

  handleEmailOnChange = (email: string) => {
    this.setState((state) => ({
      email,
      emailError: null,
      unknownError: null,
      apiErrors: state.apiErrors
        ? set(state.apiErrors, 'json.errors.email', null)
        : null,
    }));
  };

  handlePasswordOnChange = (password: string) => {
    this.setState((state) => ({
      password,
      hasMinimumLengthError: false,
      unknownError: null,
      apiErrors: state.apiErrors
        ? set(state.apiErrors, 'json.errors.password', null)
        : null,
    }));
  };

  handleOnGoToSignIn = (event: React.FormEvent) => {
    event.preventDefault();

    if (this.props.metaData?.inModal || this.props.metaData?.noPushLinks) {
      this.props.onGoToSignIn();
    } else {
      clHistory.push('/sign-in');
    }
  };

  handleTacAcceptedChange = (tacAccepted: boolean) => {
    this.setState({
      tacAccepted,
      tacError: false,
    });
  };

  handlePrivacyAcceptedChange = (privacyAccepted: boolean) => {
    this.setState({
      privacyAccepted,
      privacyError: false,
    });
  };

  handleFirstNameInputSetRef = (element: HTMLInputElement) => {
    if (element) {
      this.firstNameInputElement = element;
    }
  };
  handleLastNameInputSetRef = (element: HTMLInputElement) => {
    if (element) {
      this.lastNameInputElement = element;
    }
  };

  handleEmailInputSetRef = (element: HTMLInputElement) => {
    if (element) {
      this.emailInputElement = element;
    }
  };

  handlePasswordInputSetRef = (element: HTMLInputElement) => {
    if (element) {
      this.passwordInputElement = element;
    }
  };

  handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const { tenant } = this.props;
    const { isInvitation } = this.props.metaData;
    const { formatMessage } = this.props.intl;
    const { locale } = this.props;
    const {
      token,
      firstName,
      lastName,
      email,
      password,
      tacAccepted,
      privacyAccepted,
      processing,
    } = this.state;
    let invitationRedeemError =
      isInvitation && !token ? formatMessage(messages.noTokenError) : null;
    const phone =
      !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;
    const hasEmailError = !phone && (!email || !isValidEmail(email));
    const emailError = hasEmailError
      ? !email
        ? formatMessage(messages.noEmailError)
        : formatMessage(messages.noValidEmailError)
      : null;
    const firstNameError = !firstName
      ? formatMessage(messages.noFirstNameError)
      : null;
    const lastNameError = !lastName
      ? formatMessage(messages.noLastNameError)
      : null;
    const hasMinimumLengthError =
      typeof password === 'string'
        ? hasPasswordMinimumLength(
            password,
            !isNilOrError(tenant)
              ? tenant.attributes.settings.password_login?.minimum_length
              : undefined
          )
        : true;
    const tacError = !tacAccepted;
    const privacyError = !privacyAccepted;

    if (this.firstNameInputElement && firstNameError) {
      this.firstNameInputElement.focus();
    } else if (this.lastNameInputElement && lastNameError) {
      this.lastNameInputElement.focus();
    } else if (this.emailInputElement && emailError) {
      this.emailInputElement.focus();
    } else if (this.passwordInputElement && hasMinimumLengthError) {
      this.passwordInputElement.focus();
    }

    const hasErrors = [
      invitationRedeemError,
      emailError,
      firstNameError,
      lastNameError,
      hasMinimumLengthError,
      tacError,
      privacyError,
    ].some((error) => error);

    this.setState({
      invitationRedeemError,
      emailError,
      firstNameError,
      lastNameError,
      hasMinimumLengthError,
      tacError,
      privacyError,
    });

    if (
      !hasErrors &&
      !processing &&
      firstName &&
      lastName &&
      email &&
      password &&
      locale
    ) {
      try {
        this.setState({ processing: true, unknownError: null });
        const user = await signUp(
          firstName,
          lastName,
          email,
          password,
          locale,
          isInvitation,
          token
        );
        this.setState({ processing: false });
        trackEventByName(tracks.signUpEmailPasswordStepCompleted);
        this.props.onCompleted(user.data.id);
      } catch (errors) {
        trackEventByName(tracks.signUpEmailPasswordStepFailed, { errors });

        // custom error handling for invitation codes
        if (get(errors, 'json.errors.base[0].error') === 'token_not_found') {
          invitationRedeemError = formatMessage(messages.tokenNotFoundError);
        }

        if (get(errors, 'json.errors.base[0].error') === 'already_accepted') {
          invitationRedeemError = formatMessage(
            messages.tokenAlreadyAcceptedError
          );
        }

        this.setState({
          invitationRedeemError,
          processing: false,
          apiErrors: errors,
        });
      }
    }
  };

  goBackToSignUpOptions = (event: React.MouseEvent) => {
    event.preventDefault();

    if (this.props.metaData?.inModal || this.props.metaData?.noPushLinks) {
      this.props.onGoBack?.();
    } else {
      clHistory.push('/sign-up');
    }
  };

  get emailErrors() {
    const { tenant } = this.props;
    const { apiErrors } = this.state;

    return get(apiErrors, 'json.errors.email')?.map((error) => ({
      ...error,
      payload: {
        supportEmail: isNilOrError(tenant)
          ? 'support@citizenlab.co'
          : tenant?.attributes?.settings?.core?.reply_to_email ||
            'support@citizenlab.co',
      },
    }));
  }

  render() {
    const {
      tenant,
      windowSize,
      className,
      hasNextStep,
      passwordLoginEnabled,
      googleLoginEnabled,
      facebookLoginEnabled,
      azureAdLoginEnabled,
      franceconnectLoginEnabled,
      metaData: { isInvitation },
      intl: { formatMessage },
    } = this.props;
    const {
      token,
      firstName,
      lastName,
      email,
      password,
      processing,
      invitationRedeemError,
      firstNameError,
      lastNameError,
      emailError,
      hasMinimumLengthError,
      apiErrors,
    } = this.state;
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

    let unknownApiError: string | null = null;

    if (apiErrors) {
      if (isCLErrorJSON(apiErrors)) {
        // weirdly TS doesn't understand my typeguard.
        const fieldKeys = keys((apiErrors as any).json.errors);

        if (
          difference(fieldKeys, [
            'first_name',
            'last_name',
            'email',
            'password',
            'base',
          ]).length > 0
        ) {
          unknownApiError = formatMessage(messages.unknownError);
        }
      } else {
        unknownApiError = formatMessage(messages.unknownError);
      }
    }

    return (
      <Container
        id="e2e-sign-up-email-password-container"
        className={className}
      >
        <>
          <Form
            id="e2e-signup-password"
            onSubmit={this.handleOnSubmit}
            noValidate={true}
          >
            {isInvitation && !this.props.metaData.token && (
              <FormElement id="e2e-token-container">
                <FormLabel labelMessage={messages.tokenLabel} htmlFor="token" />
                <Input
                  id="token"
                  type="text"
                  value={token}
                  placeholder={formatMessage(messages.tokenPlaceholder)}
                  error={invitationRedeemError}
                  onChange={this.handleTokenOnChange}
                  autoFocus={
                    !!(
                      isDesktop &&
                      isInvitation &&
                      !this.props.metaData.token &&
                      !this.props.metaData?.noAutofocus
                    )
                  }
                />
              </FormElement>
            )}

            <FormElement id="e2e-firstName-container">
              <FormLabel
                labelMessage={messages.firstNamesLabel}
                htmlFor="firstName"
              />
              <Input
                id="firstName"
                type="text"
                value={firstName}
                placeholder={formatMessage(messages.firstNamesPlaceholder)}
                error={firstNameError}
                onChange={this.handleFirstNameOnChange}
                autocomplete="given-name"
                autoFocus={
                  !this.props.metaData?.noAutofocus &&
                  isDesktop &&
                  (!isInvitation ||
                    !!(isInvitation && this.props.metaData.token))
                }
                setRef={this.handleFirstNameInputSetRef}
              />
              <Error
                fieldName={'first_name'}
                apiErrors={get(apiErrors, 'json.errors.first_name')}
              />
            </FormElement>

            <FormElement id="e2e-lastName-container">
              <FormLabel
                labelMessage={messages.lastNameLabel}
                htmlFor="lastName"
              />
              <Input
                id="lastName"
                type="text"
                value={lastName}
                placeholder={formatMessage(messages.lastNamePlaceholder)}
                error={lastNameError}
                onChange={this.handleLastNameOnChange}
                autocomplete="family-name"
                setRef={this.handleLastNameInputSetRef}
              />
              <Error
                fieldName={'last_name'}
                apiErrors={get(apiErrors, 'json.errors.last_name')}
              />
            </FormElement>

            <FormElement id="e2e-email-container">
              <FormLabel
                labelMessage={
                  phone ? messages.emailOrPhoneLabel : messages.emailLabel
                }
                htmlFor="email"
              />
              <Input
                type="email"
                id="email"
                value={email}
                placeholder={formatMessage(messages.emailPlaceholder)}
                error={emailError}
                onChange={this.handleEmailOnChange}
                autocomplete="email"
                setRef={this.handleEmailInputSetRef}
              />
              <Error fieldName={'email'} apiErrors={this.emailErrors} />
            </FormElement>

            <FormElement id="e2e-password-container">
              <LabelContainer>
                <StyledFormLabel
                  labelMessage={messages.passwordLabel}
                  htmlFor="signup-password-input"
                />
                <StyledPasswordInputIconTooltip />
              </LabelContainer>
              <PasswordInput
                id="password"
                password={password}
                placeholder={formatMessage(messages.passwordPlaceholder)}
                onChange={this.handlePasswordOnChange}
                autocomplete="new-password"
                errors={{ minimumLengthError: hasMinimumLengthError }}
                setRef={this.handlePasswordInputSetRef}
              />
              <Error
                fieldName={'password'}
                apiErrors={get(apiErrors, 'json.errors.password')}
              />
            </FormElement>

            <FormElement>
              <StyledConsent
                tacError={this.state.tacError}
                privacyError={this.state.privacyError}
                onTacAcceptedChange={this.handleTacAcceptedChange}
                onPrivacyAcceptedChange={this.handlePrivacyAcceptedChange}
              />
            </FormElement>

            <FormElement>
              <ButtonWrapper>
                <Button
                  id="e2e-signup-password-submit-button"
                  processing={processing}
                  text={formatMessage(
                    hasNextStep ? messages.nextStep : messages.signUp2
                  )}
                  onClick={this.handleOnSubmit}
                />
              </ButtonWrapper>
            </FormElement>

            <Error text={invitationRedeemError || unknownApiError} />
          </Form>

          <Options>
            <Option>
              {enabledProviders.length > 1 ? (
                <button onClick={this.goBackToSignUpOptions} className="link">
                  <FormattedMessage {...messages.backToSignUpOptions} />
                </button>
              ) : (
                <FormattedMessage
                  {...messages.goToLogIn}
                  values={{
                    goToOtherFlowLink: (
                      <button
                        onClick={this.handleOnGoToSignIn}
                        className="link"
                      >
                        {formatMessage(messages.logIn2)}
                      </button>
                    ),
                  }}
                />
              )}
            </Option>
          </Options>
        </>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
  windowSize: <GetWindowSize />,
  passwordLoginEnabled: <GetFeatureFlag name="password_login" />,
  googleLoginEnabled: <GetFeatureFlag name="google_login" />,
  facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  azureAdLoginEnabled: <GetFeatureFlag name="azure_ad_login" />,
  franceconnectLoginEnabled: <GetFeatureFlag name="franceconnect_login" />,
});

const PasswordSignupWithHoC = injectIntl<Props>(PasswordSignup);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <PasswordSignupWithHoC {...inputProps} {...dataprops} />}
  </Data>
);
