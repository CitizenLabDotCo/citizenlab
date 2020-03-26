import React, { PureComponent } from 'react';
import { set, keys, difference, get, isEmpty } from 'lodash-es';
import { adopt } from 'react-adopt';

// libraries
import Link from 'utils/cl-router/Link';

// components
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Checkbox from 'components/UI/Checkbox';
import { FormLabel } from 'components/UI/FormComponents';

// utils
import { isValidEmail } from 'utils/validate';
import { isCLErrorJSON } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

// services
import { signUp } from 'services/auth';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInvitedUser, { GetInvitedUserChildProps } from 'resources/GetInvitedUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// style
import { darken } from 'polished';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
import { CLErrorsJSON } from 'typings';
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div``;

const SignUpHelperText = styled.p`
  color: ${(props) => props.theme.colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: 20px;
  padding-bottom: 20px;
`;

const Form = styled.form`
  width: 100%;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
`;

const TermsAndConditionsWrapper = styled.div`
  padding: 15px 20px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${darken(0.04, colors.background)};

  &.error {
    border-color: ${(props: any) => props.theme.colors.clRedError};
  }

  span {
    color: ${colors.text} !important;
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: 21px;
  }

  a > span {
    color: ${colors.text} !important;
    text-decoration: underline;
  }

  a:hover > span {
    color: #000 !important;
    text-decoration: underline;
  }
`;

const GoToSignInButton = styled(Button)``;

type InputProps = {
  metaData: ISignUpInMetaData;
  isInvitation?: boolean | undefined;
  token?: string | null | undefined;
  onCompleted: (userId: string) => void;
  onGoToSignIn: () => void;
  className?: string;
};

interface DataProps {
  locale: GetLocaleChildProps;
  invitedUser: GetInvitedUserChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps { }

type State = {
  token: string | null | undefined;
  firstName: string | null;
  lastName: string | null;
  email: string | null | undefined;
  password: string | null;
  tacAccepted: boolean;
  emailAccepted: boolean;
  privacyAccepted: boolean;
  processing: boolean;
  tokenError: string | null;
  firstNameError: string | null;
  lastNameError: string | null;
  emailError: string | null;
  emailConsentError: string | null;
  privacyError: string | null;
  passwordError: string | null;
  tacError: string | null;
  unknownError: string | null;
  apiErrors: CLErrorsJSON | null | Error;
  emailInvitationTokenInvalid: boolean;
};

class PasswordSignup extends PureComponent<Props & InjectedIntlProps, State> {
  firstNameInputElement: HTMLInputElement | null;

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      token: props.token,
      firstName: props.invitedUser.user?.attributes.first_name || null,
      lastName: props.invitedUser.user?.attributes.last_name || null,
      email: props.invitedUser.user?.attributes.email || null,
      password: null,
      tacAccepted: false,
      emailAccepted: false,
      privacyAccepted: false,
      processing: false,
      tokenError: null,
      firstNameError: null,
      lastNameError: null,
      emailError: null,
      emailConsentError: null,
      passwordError: null,
      tacError: null,
      privacyError: null,
      unknownError: null,
      apiErrors: null,
      emailInvitationTokenInvalid: props.invitedUser?.isInvalidToken
    };
    this.firstNameInputElement = null;
  }

  handleFirstNameInputSetRef = (element: HTMLInputElement) => {
    if (!(this.props.isInvitation && !this.props.token) && element) {
      this.firstNameInputElement = element;
      this.firstNameInputElement.focus();
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

  handleTaCAcceptedOnChange = () => {
    this.setState(state => ({ tacAccepted: !state.tacAccepted, tacError: null }));
  }

  handleEmailAcceptedOnChange = () => {
    this.setState(state => ({ emailAccepted: !state.emailAccepted, emailError: null }));
  }

  handlePrivacyAcceptedOnChange = () => {
    this.setState(state => ({ privacyAccepted: !state.privacyAccepted, privacyError: null }));
  }

  handleOnGoToSignIn = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.onGoToSignIn();
  }

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { isInvitation, tenant } = this.props;
    const { formatMessage } = this.props.intl;
    const { locale } = this.props;
    const { token, firstName, lastName, email, password, tacAccepted, privacyAccepted, emailAccepted } = this.state;
    let tokenError = ((isInvitation && !token) ? formatMessage(messages.noTokenError) : null);
    const phone = !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;
    const hasEmailError = !phone && (!email || !isValidEmail(email));
    const emailError = (hasEmailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const firstNameError = (!firstName ? formatMessage(messages.noFirstNameError) : null);
    const lastNameError = (!lastName ? formatMessage(messages.noLastNameError) : null);
    const tacError = (!tacAccepted ? formatMessage(messages.tacError) : null);
    const privacyError = (!privacyAccepted ? formatMessage(messages.privacyError) : null);
    const emailConsentError = (!emailAccepted ? formatMessage(messages.emailConsentError) : null);
    let passwordError: string | null = null;

    if (!password) {
      passwordError = formatMessage(messages.noPasswordError);
    } else if (password.length < 8) {
      passwordError = formatMessage(messages.noValidPasswordError);
    }

    const hasErrors = [tokenError, emailError, firstNameError, lastNameError, passwordError, tacError, privacyError, emailConsentError].some(error => error !== null);

    this.setState({ tokenError, emailError, firstNameError, lastNameError, passwordError, tacError, privacyError, emailConsentError });

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

  render() {
    const { isInvitation, tenant, className } = this.props;
    const { formatMessage } = this.props.intl;
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
    const buttonText = (isInvitation ? formatMessage(messages.redeem) : formatMessage(messages.signUp));
    const phone = !isNilOrError(tenant) && tenant.attributes.settings.password_login?.phone;
    const helperText = isNilOrError(tenant) ? null : tenant.attributes.settings.core.signup_helper_text;

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
        {!isEmpty(helperText) &&
          <SignUpHelperText>
            <T value={helperText} supportHtml />
          </SignUpHelperText>
        }

        {!emailInvitationTokenInvalid ?
          <Form id="e2e-signup-step1" onSubmit={this.handleOnSubmit} noValidate={true}>
            {isInvitation && !this.props.token &&
              <FormElement>
                <FormLabel labelMessage={messages.tokenLabel} htmlFor="token" thin />
                <Input
                  id="token"
                  type="text"
                  value={token}
                  placeholder={formatMessage(messages.tokenPlaceholder)}
                  error={tokenError}
                  onChange={this.handleTokenOnChange}
                />
              </FormElement>
            }

            <FormElement>
              <FormLabel labelMessage={messages.firstNamesLabel} htmlFor="firstName" thin />
              <Input
                id="firstName"
                type="text"
                value={firstName}
                placeholder={formatMessage(messages.firstNamesPlaceholder)}
                error={firstNameError}
                onChange={this.handleFirstNameOnChange}
                setRef={this.handleFirstNameInputSetRef}
                autocomplete="given-name"
                onGreyBackground
              />
              <Error fieldName={'first_name'} apiErrors={get(apiErrors, 'json.errors.first_name')} />
            </FormElement>

            <FormElement>
              <FormLabel labelMessage={messages.lastNameLabel} htmlFor="lastName" thin />
              <Input
                id="lastName"
                type="text"
                value={lastName}
                placeholder={formatMessage(messages.lastNamePlaceholder)}
                error={lastNameError}
                onChange={this.handleLastNameOnChange}
                autocomplete="family-name"
                onGreyBackground
              />
              <Error fieldName={'last_name'} apiErrors={get(apiErrors, 'json.errors.last_name')} />
            </FormElement>

            <FormElement>
              <FormLabel labelMessage={phone ? messages.emailOrPhoneLabel : messages.emailLabel} htmlFor="email" thin />
              <Input
                type="email"
                id="email"
                value={email}
                placeholder={formatMessage(messages.emailPlaceholder)}
                error={emailError}
                onChange={this.handleEmailOnChange}
                autocomplete="email"
                onGreyBackground
              />
              <Error fieldName={'email'} apiErrors={get(apiErrors, 'json.errors.email')} />
            </FormElement>

            <FormElement>
              <FormLabel labelMessage={messages.passwordLabel} htmlFor="password" thin />
              <Input
                type="password"
                id="password"
                value={password}
                placeholder={formatMessage(messages.passwordPlaceholder)}
                error={passwordError}
                onChange={this.handlePasswordOnChange}
                autocomplete="new-password"
                onGreyBackground
              />
              <Error fieldName={'password'} apiErrors={get(apiErrors, 'json.errors.password')} />
            </FormElement>

            <FormElement>
              <TermsAndConditionsWrapper className={`${this.state.tacError && 'error'}`}>
                <Checkbox
                  id="terms-and-conditions-checkbox"
                  className="e2e-terms-and-conditions"
                  checked={this.state.tacAccepted}
                  onChange={this.handleTaCAcceptedOnChange}
                  label={
                    <FormattedMessage
                      {...messages.tacApproval}
                      values={{
                        tacLink: <Link target="_blank" to="/pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link>,
                      }}
                    />
                  }
                />
              </TermsAndConditionsWrapper>
              <TermsAndConditionsWrapper className={`${this.state.privacyError && 'error'}`}>
                <Checkbox
                  id="privacy-checkbox"
                  className="e2e-privacy-checkbox"
                  checked={this.state.privacyAccepted}
                  onChange={this.handlePrivacyAcceptedOnChange}
                  label={
                    <FormattedMessage
                      {...messages.privacyApproval}
                      values={{
                        ppLink: <Link target="_blank" to="/pages/privacy-policy"><FormattedMessage {...messages.privacyPolicy} /></Link>,
                      }}
                    />
                  }
                />
              </TermsAndConditionsWrapper>
              <TermsAndConditionsWrapper className={`${this.state.emailConsentError && 'error'}`}>
                <Checkbox
                  id="privacy-checkbox"
                  className="e2e-email-checkbox"
                  checked={this.state.emailAccepted}
                  onChange={this.handleEmailAcceptedOnChange}
                  label={
                    <FormattedMessage
                      {...messages.emailApproval}
                    />
                  }
                />
              </TermsAndConditionsWrapper>
              <Error text={this.state.tacError} />
              <Error text={this.state.privacyError} />
              <Error text={this.state.emailConsentError} />
            </FormElement>

            <FormElement>
              <ButtonWrapper>
                <Button
                  id="e2e-signup-step1-button"
                  processing={processing}
                  text={buttonText}
                  onClick={this.handleOnSubmit}
                />
                {!isInvitation &&
                  <GoToSignInButton
                    buttonStyle="text"
                    padding="0px"
                    onClick={this.handleOnGoToSignIn}
                  >
                    <FormattedMessage {...messages.alreadyHaveAnAccount} />
                  </GoToSignInButton>
                }
              </ButtonWrapper>
            </FormElement>

            <Error text={unknownApiError} />
            <Error text={((isInvitation && this.props.token && tokenError) ? tokenError : null)} />
          </Form>
          :
          <Error
            text={<FormattedMessage
              {...messages.emailInvitationTokenInvalid}
              values={{
                signUpPageLink: (
                  <Link
                    to={'/sign-up'}
                  >
                    {formatMessage(messages.signUpPage)}
                  </Link>)
              }}
            />}
          />
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  invitedUser: ({ token, render }) => <GetInvitedUser token={token || null}>{render}</GetInvitedUser>
});

const PasswordSignupWithHoC = injectIntl<Props>(PasswordSignup);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <PasswordSignupWithHoC {...inputProps} {...dataprops} />}
  </Data>
);
