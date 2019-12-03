import React from 'react';
import { set, keys, difference, get } from 'lodash-es';
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

// services
import { signUp } from 'services/auth';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInvitedUser, { GetInvitedUserChildProps } from 'resources/GetInvitedUser';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import { darken } from 'polished';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

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

const AlreadyHaveAnAccount = styled(Link)`
  color: ${(props) => props.theme.colorMain};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  margin-left: 15px;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
    text-decoration: underline;
  }
`;

type InputProps = {
  isInvitation?: boolean | undefined;
  token?: string | null | undefined;
  onCompleted: (userId: string) => void;
};

interface DataProps {
  locale: GetLocaleChildProps;
  invitedUser: GetInvitedUserChildProps;
}

interface Props extends InputProps, DataProps { }

type State = {
  token: string | null | undefined;
  firstName: string | null;
  lastName: string | null;
  email: string | null | undefined;
  password: string | null;
  tacAccepted: boolean;
  processing: boolean;
  tokenError: string | null;
  firstNameError: string | null;
  lastNameError: string | null;
  emailError: string | null;
  passwordError: string | null;
  tacError: string | null;
  unknownError: string | null;
  apiErrors: CLErrorsJSON | null | Error;
  emailInvitationTokenInvalid: boolean;
};

class Step1 extends React.PureComponent<Props & InjectedIntlProps, State> {
  firstNameInputElement: HTMLInputElement | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      token: props.token,
      firstName: props.invitedUser.user?.attributes.first_name || null,
      lastName: props.invitedUser.user?.attributes.last_name || null,
      email: props.invitedUser.user?.attributes.email || null,
      password: null,
      tacAccepted: false,
      processing: false,
      tokenError: null,
      firstNameError: null,
      lastNameError: null,
      emailError: null,
      passwordError: null,
      tacError: null,
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

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { isInvitation } = this.props;
    const { formatMessage } = this.props.intl;
    const { locale } = this.props;
    const { token, firstName, lastName, email, password, tacAccepted } = this.state;
    let tokenError = ((isInvitation && !token) ? formatMessage(messages.noTokenError) : null);
    const hasEmailError = (!email || !isValidEmail(email));
    const emailError = (hasEmailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const firstNameError = (!firstName ? formatMessage(messages.noFirstNameError) : null);
    const lastNameError = (!lastName ? formatMessage(messages.noLastNameError) : null);
    const tacError = (!tacAccepted ? formatMessage(messages.tacError) : null);
    let passwordError: string | null = null;

    if (!password) {
      passwordError = formatMessage(messages.noPasswordError);
    } else if (password.length < 8) {
      passwordError = formatMessage(messages.noValidPasswordError);
    }

    const hasErrors = [tokenError, emailError, firstNameError, lastNameError, passwordError, tacError].some(error => error !== null);

    this.setState({ tokenError, emailError, firstNameError, lastNameError, passwordError, tacError });

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
    const { isInvitation } = this.props;
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
      <>
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
              />

              <Error fieldName={'last_name'} apiErrors={get(apiErrors, 'json.errors.last_name')} />
            </FormElement>

            <FormElement>
              <FormLabel labelMessage={messages.emailLabel} htmlFor="email" thin />
              <Input
                type="email"
                id="email"
                value={email}
                placeholder={formatMessage(messages.emailPlaceholder)}
                error={emailError}
                onChange={this.handleEmailOnChange}
                autocomplete="email"
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
                      {...messages.gdprApproval}
                      values={{
                        tacLink: <Link target="_blank" to="/pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link>,
                        ppLink: <Link target="_blank" to="/pages/privacy-policy"><FormattedMessage {...messages.privacyPolicy} /></Link>,
                      }}
                    />
                  }
                />
              </TermsAndConditionsWrapper>
              <Error text={this.state.tacError} />
            </FormElement>

            <FormElement>
              <ButtonWrapper>
                <Button
                  id="e2e-signup-step1-button"
                  size="1"
                  processing={processing}
                  text={buttonText}
                  onClick={this.handleOnSubmit}
                />
                {!isInvitation &&
                  <AlreadyHaveAnAccount to="/sign-in">
                    <FormattedMessage {...messages.alreadyHaveAnAccount} />
                  </AlreadyHaveAnAccount>
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
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  invitedUser: ({ token, render }) => <GetInvitedUser token={token || null}>{render}</GetInvitedUser>,
});

const Step1WithHocs = injectIntl<Props>(Step1);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <Step1WithHocs {...inputProps} {...dataprops} />}
  </Data>
);
