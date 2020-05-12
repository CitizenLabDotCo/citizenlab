import React, { PureComponent } from 'react';
import { set, keys, difference, get } from 'lodash-es';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';

// libraries
import Link from 'utils/cl-router/Link';

// components
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
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
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import GetInvitedUser, { GetInvitedUserChildProps } from 'resources/GetInvitedUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetFeatureFlag from 'resources/GetFeatureFlag';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

// typings
import { CLErrorsJSON } from 'typings';
import { ISignUpInMetaData } from 'components/SignUpIn';

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
  tenant: GetTenantChildProps;
  windowSize: GetWindowSizeChildProps;
  invitedUser: GetInvitedUserChildProps;
  passwordLoginEnabled: boolean | null;
  googleLoginEnabled: boolean | null;
  facebookLoginEnabled: boolean | null;
  azureAdLoginEnabled: boolean | null;
  franceconnectLoginEnabled: boolean | null;
}

interface Props extends InputProps, DataProps { }

type State = {
  token: string | null | undefined;
  firstName: string | null;
  lastName: string | null;
  email: string | null | undefined;
  password: string | null;
  tacAccepted: boolean;
  privacyAccepted: boolean;
  processing: boolean;
  tokenError: string | null;
  firstNameError: string | null;
  lastNameError: string | null;
  emailError: string | null;
  privacyError: boolean;
  passwordError: string | null;
  tacError: boolean;
  unknownError: string | null;
  apiErrors: CLErrorsJSON | null | Error;
  emailInvitationTokenInvalid: boolean;
};

class PasswordSignup extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      token: props.metaData.token,
      firstName: props.invitedUser.user?.attributes.first_name || null,
      lastName: props.invitedUser.user?.attributes.last_name || null,
      email: props.invitedUser.user?.attributes.email || null,
      password: null,
      tacAccepted: false,
      privacyAccepted: false,
      processing: false,
      tokenError: null,
      firstNameError: null,
      lastNameError: null,
      emailError: null,
      passwordError: null,
      tacError: false,
      privacyError: false,
      unknownError: null,
      apiErrors: null,
      emailInvitationTokenInvalid: props.invitedUser?.isInvalidToken
    };
  }

  componentDidUpdate(prevprops: Props) {
    if (prevprops.invitedUser !== this.props.invitedUser) {
      this.setState({ emailInvitationTokenInvalid: this.props.invitedUser?.isInvalidToken });
    }
  }

  handleTokenOnChange = (token: string) => {
    this.setState({
      token,
      tokenError: null,
      unknownError: null
    });
  }

  handleFirstNameOnChange = (firstName: string) => {
    this.setState((state) => ({
      firstName,
      firstNameError: null,
      unknownError: null,
      apiErrors: (state.apiErrors ? set(state.apiErrors, 'json.errors.first_name', null) : null)
    }));
  }

  handleLastNameOnChange = (lastName: string) => {
    this.setState((state) => ({
      lastName,
      lastNameError: null,
      unknownError: null,
      apiErrors: (state.apiErrors ? set(state.apiErrors, 'json.errors.last_name', null) : null)
    }));
  }

  handleEmailOnChange = (email: string) => {
    this.setState((state) => ({
      email,
      emailError: null,
      unknownError: null,
      apiErrors: (state.apiErrors ? set(state.apiErrors, 'json.errors.email', null) : null)
    }));
  }

  handlePasswordOnChange = (password: string) => {
    this.setState((state) => ({
      password,
      passwordError: null,
      unknownError: null,
      apiErrors: (state.apiErrors ? set(state.apiErrors, 'json.errors.password', null) : null)
    }));
  }

  handleOnGoToSignIn = (event: React.FormEvent) => {
    event.preventDefault();

    if (this.props.metaData?.inModal) {
      this.props.onGoToSignIn();
    } else {
      clHistory.push('/sign-in');
    }
  }

  handleTacAcceptedChange = (tacAccepted: boolean) => {
    this.setState({
      tacAccepted,
      tacError: false
    });
  }

  handlePrivacyAcceptedChange = (privacyAccepted: boolean) => {
    this.setState({
      privacyAccepted,
      privacyError: false
    });
  }

  handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const { tenant } = this.props;
    const { isInvitation } = this.props.metaData;
    const { formatMessage } = this.props.intl;
    const { locale } = this.props;
    const { token, firstName, lastName, email, password, tacAccepted, privacyAccepted } = this.state;
    let tokenError = ((isInvitation && !token) ? formatMessage(messages.noTokenError) : null);
    const phone = !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;
    const hasEmailError = !phone && (!email || !isValidEmail(email));
    const emailError = (hasEmailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const firstNameError = (!firstName ? formatMessage(messages.noFirstNameError) : null);
    const lastNameError = (!lastName ? formatMessage(messages.noLastNameError) : null);
    const tacError = !tacAccepted;
    const privacyError = !privacyAccepted;
    let passwordError: string | null = null;

    if (!password) {
      passwordError = formatMessage(messages.noPasswordError);
    } else if (password.length < 8) {
      passwordError = formatMessage(messages.noValidPasswordError);
    }

    const hasErrors = [tokenError, emailError, firstNameError, lastNameError, passwordError, tacError, privacyError].some(error => error);

    this.setState({ tokenError, emailError, firstNameError, lastNameError, passwordError, tacError, privacyError });

    if (!hasErrors && firstName && lastName && email && password && locale) {
      try {
        this.setState({ processing: true, unknownError: null });
        const user = await signUp(firstName, lastName, email, password, locale, isInvitation, token);
        this.setState({ processing: false });
        this.props.onCompleted(user.data.id);
      } catch (errors) {
        // custom error handling for invitation codes
        if (get(errors, 'json.errors.base[0].error', null) === 'token_not_found') {
          tokenError = formatMessage(messages.tokenNotFoundError);
        }

        if (get(errors, 'json.errors.base[0].error', null) === 'already_accepted') {
          tokenError = formatMessage(messages.tokenAlreadyAcceptedError);
        }

        this.setState({
          tokenError,
          processing: false,
          apiErrors: errors
        });
      }
    }
  }

  goBackToSignUpOptions = (event: React.MouseEvent) => {
    event.preventDefault();
    this.props.onGoBack && this.props.onGoBack();
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
      intl: { formatMessage }
    } = this.props;
    const {
      token,
      firstName,
      lastName,
      email,
      password,
      processing,
      tokenError,
      firstNameError,
      lastNameError,
      emailError,
      passwordError,
      apiErrors,
      emailInvitationTokenInvalid
    } = this.state;
    const phone = !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;
    const signUpPageLink = <Link to={'/sign-up'}>{formatMessage(messages.signUpPage)}</Link>;
    const enabledProviders = [passwordLoginEnabled, googleLoginEnabled, facebookLoginEnabled, azureAdLoginEnabled, franceconnectLoginEnabled].filter(provider => provider === true);
    const isDesktop = windowSize ? windowSize > viewportWidths.largeTablet : true;

    let unknownApiError: string | null = null;

    if (apiErrors) {
      if (isCLErrorJSON(apiErrors)) {
        // weirdly TS doesn't understand my typeguard.
        const fieldKeys = keys((apiErrors as any).json.errors);

        if (difference(fieldKeys, ['first_name', 'last_name', 'email', 'password', 'base']).length > 0) {
          unknownApiError = formatMessage(messages.unknownError);
        }
      } else {
        unknownApiError = formatMessage(messages.unknownError);
      }
    }

    return (
      <Container className={className}>
        {!emailInvitationTokenInvalid &&
          <>
            <Form
              id="e2e-signup-password"
              onSubmit={this.handleOnSubmit}
              noValidate={true}
            >
              {isInvitation && !this.props.metaData.token &&
                <FormElement>
                  <FormLabel
                    labelMessage={messages.tokenLabel}
                    htmlFor="token"
                  />
                  <Input
                    id="token"
                    type="text"
                    value={token}
                    placeholder={formatMessage(messages.tokenPlaceholder)}
                    error={tokenError}
                    onChange={this.handleTokenOnChange}
                    autoFocus={!!(isDesktop && isInvitation && !this.props.metaData.token)}
                  />
                </FormElement>
              }

              <FormElement>
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
                  autoFocus={isDesktop && (!isInvitation || !!(isInvitation && this.props.metaData.token))}
                />
                <Error
                  fieldName={'first_name'}
                  apiErrors={get(apiErrors, 'json.errors.first_name')}
                />
              </FormElement>

              <FormElement>
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
                />
                <Error
                  fieldName={'last_name'}
                  apiErrors={get(apiErrors, 'json.errors.last_name')}
                />
              </FormElement>

              <FormElement>
                <FormLabel
                  labelMessage={phone ? messages.emailOrPhoneLabel : messages.emailLabel}
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
                />
                <Error
                  fieldName={'email'}
                  apiErrors={get(apiErrors, 'json.errors.email')}
                />
              </FormElement>

              <FormElement>
                <FormLabel
                  labelMessage={messages.passwordLabel}
                  htmlFor="password"
                />
                <Input
                  type="password"
                  id="password"
                  value={password}
                  placeholder={formatMessage(messages.passwordPlaceholder)}
                  error={passwordError}
                  onChange={this.handlePasswordOnChange}
                  autocomplete="new-password"
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
                    id="e2e-signup-password-button"
                    processing={processing}
                    text={formatMessage(hasNextStep ? messages.nextStep : messages.signUp2)}
                    onClick={this.handleOnSubmit}
                  />
                </ButtonWrapper>
              </FormElement>

              <Error text={unknownApiError} />
              <Error text={(isInvitation && this.props.metaData.token && tokenError) ? tokenError : null} />
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
                        <button onClick={this.handleOnGoToSignIn} className="link">
                          {formatMessage(messages.logIn2)}
                        </button>
                      )
                    }}
                  />
                )}
              </Option>
            </Options>
          </>
        }

        {emailInvitationTokenInvalid &&
          <Error
            animate={false}
            text={<FormattedMessage {...messages.emailInvitationTokenInvalid} values={{ signUpPageLink }} />}
          />
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  windowSize: <GetWindowSize />,
  invitedUser: ({ metaData: { token }, render }) => <GetInvitedUser token={token || null}>{render}</GetInvitedUser>,
  passwordLoginEnabled: <GetFeatureFlag name="password_login" />,
  googleLoginEnabled: <GetFeatureFlag name="google_login" />,
  facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  azureAdLoginEnabled: <GetFeatureFlag name="azure_ad_login" />,
  franceconnectLoginEnabled: <GetFeatureFlag name="franceconnect_login" />
});

const PasswordSignupWithHoC = injectIntl<Props>(PasswordSignup);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <PasswordSignupWithHoC {...inputProps} {...dataprops} />}
  </Data>
);
