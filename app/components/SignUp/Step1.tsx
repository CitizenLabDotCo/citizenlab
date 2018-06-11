import React from 'react';
import { set, keys, difference, get } from 'lodash';
import { Subscription } from 'rxjs/Rx';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import { isNilOrError } from 'utils/helperUtils';

// libraries
import { Link } from 'react-router';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Checkbox from 'components/UI/Checkbox';

// utils
import { isValidEmail } from 'utils/validate';
import { hasCustomFields } from 'utils/customFields';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { signUp } from 'services/auth';
import { userByInviteStream, completeRegistration } from 'services/users';
import { customFieldsSchemaForUsersStream } from 'services/userCustomFields';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import { darken } from 'polished';
import styled from 'styled-components';

// typings
import { API, Locale } from 'typings';

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

const TermsAndConditionsWrapper: any = styled.div`
  padding: 15px 30px;
  border-radius: 5px;
  background: #f0f1f3;
  border: solid 1px transparent;

  &.error {
    border-color: ${(props: any) => props.theme.colors.error};
  }

  span {
    color: #707075 !important;
    font-size: 16px;
    font-weight: 400;
    line-height: 21px;
  }

  a > span {
    color: #707075 !important;
    text-decoration: underline;
  }

  a:hover > span {
    color: #000 !important;
    text-decoration: underline;
  }
`;

const AlreadyHaveAnAccount = styled(Link)`
  color: ${(props) => props.theme.colorMain};
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  margin-left: 15px;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
  }
`;

type Props = {
  isInvitation?: boolean | undefined;
  token?: string | null | undefined;
  onCompleted: (userId: string) => void;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  hasCustomFields: boolean;
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
  localeError: string | null;
  unknownError: string | null;
  apiErrors: API.ErrorResponse | null;
};

class Step1 extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Subscription[];
  firstNameInputElement: HTMLInputElement | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      hasCustomFields: false,
      token: null,
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      tacAccepted: false,
      processing: false,
      tokenError: null,
      firstNameError: null,
      lastNameError: null,
      emailError: null,
      passwordError: null,
      tacError: null,
      localeError: null,
      unknownError: null,
      apiErrors: null
    };
    this.subscriptions = [];
    this.firstNameInputElement = null;
  }

  componentDidMount() {
    const { token } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const customFieldsSchemaForUsersStream$ = customFieldsSchemaForUsersStream().observable;
    const invitedUser$ = (token ? userByInviteStream(token, { cacheStream: false }).observable : of(null));

    this.subscriptions = [
      combineLatest(
        locale$,
        currentTenant$,
        customFieldsSchemaForUsersStream$,
        invitedUser$.first()
      ).subscribe(([locale, currentTenant, customFieldsSchema, invitedUser]) => {
        this.setState((state) => ({
          locale,
          currentTenant,
          token,
          firstName: (!isNilOrError(invitedUser) && invitedUser.data ? invitedUser.data.attributes.first_name : state.firstName),
          lastName: (!isNilOrError(invitedUser) && invitedUser.data ? invitedUser.data.attributes.last_name : state.lastName),
          email: (!isNilOrError(invitedUser) && invitedUser.data ? invitedUser.data.attributes.email : state.email),
          hasCustomFields: hasCustomFields(customFieldsSchema, locale)
        }));
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
    const { locale, currentTenant, hasCustomFields, token, firstName, lastName, email, password, tacAccepted } = this.state;
    const currentTenantLocales = currentTenant ? currentTenant.data.attributes.settings.core.locales : [];
    let tokenError = ((isInvitation && !token) ? formatMessage(messages.noTokenError) : null);
    const hasEmailError = (!email || !isValidEmail(email));
    const emailError = (hasEmailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const firstNameError = (!firstName ? formatMessage(messages.noFirstNameError) : null);
    const lastNameError = (!lastName ? formatMessage(messages.noLastNameError) : null);
    const localeError = (!currentTenantLocales.some(currentTenantLocale => locale === currentTenantLocale) ? formatMessage(messages.noValidLocaleError) : null);
    const tacError = (!tacAccepted ? formatMessage(messages.tacError) : null);
    let passwordError: string | null = null;

    if (!password) {
      passwordError = formatMessage(messages.noPasswordError);
    } else if (password.length < 8) {
      passwordError = formatMessage(messages.noValidPasswordError);
    }

    const hasErrors = [tokenError, emailError, firstNameError, lastNameError, passwordError, localeError, tacError].some(error => error !== null);

    this.setState({ tokenError, emailError, firstNameError, lastNameError, passwordError, localeError, tacError });

    if (!hasErrors && firstName && lastName && email && password && locale) {
      try {
        this.setState({
          processing: true,
          unknownError: null
        });

        const user = await signUp(firstName, lastName, email, password, locale, isInvitation, token);

        if (!hasCustomFields) {
          await completeRegistration({});
        }

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
      apiErrors
    } = this.state;
    const buttonText = (isInvitation ? formatMessage(messages.redeem) : formatMessage(messages.signUp));

    let unknownApiError: string | null = null;

    if (apiErrors && apiErrors.json.errors) {
      const fieldKeys = keys(apiErrors.json.errors);

      if (difference(fieldKeys, ['first_name', 'last_name', 'email', 'password', 'locale', 'base']).length > 0) {
        unknownApiError = formatMessage(messages.unknownError);
      }
    }

    return (
      <Form id="e2e-signup-step1" onSubmit={this.handleOnSubmit} noValidate={true}>
        {isInvitation && !this.props.token &&
          <FormElement>
            <Label value={formatMessage(messages.tokenLabel)} htmlFor="token" />
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
          <Label value={formatMessage(messages.firstNameLabel)} htmlFor="firstName" />
          <Input
            id="firstName"
            type="text"
            value={firstName}
            placeholder={formatMessage(messages.firstNamePlaceholder)}
            error={firstNameError}
            onChange={this.handleFirstNameOnChange}
            setRef={this.handleFirstNameInputSetRef}
          />

          <Error fieldName={'first_name'} apiErrors={get(apiErrors, 'json.errors.first_name')} />
        </FormElement>

        <FormElement>
          <Label value={formatMessage(messages.lastNameLabel)} htmlFor="lastName" />
          <Input
            id="lastName"
            type="text"
            value={lastName}
            placeholder={formatMessage(messages.lastNamePlaceholder)}
            error={lastNameError}
            onChange={this.handleLastNameOnChange}
          />

          <Error fieldName={'last_name'} apiErrors={get(apiErrors, 'json.errors.last_name')} />
        </FormElement>

        <FormElement>
          <Label value={formatMessage(messages.emailLabel)} htmlFor="email" />
          <Input
            type="email"
            id="email"
            value={email}
            placeholder={formatMessage(messages.emailPlaceholder)}
            error={emailError}
            onChange={this.handleEmailOnChange}
          />

          <Error fieldName={'email'} apiErrors={get(apiErrors, 'json.errors.email')} />
        </FormElement>

        <FormElement>
          <Label value={formatMessage(messages.passwordLabel)} htmlFor="password" />
          <Input
            type="password"
            id="password"
            value={password}
            placeholder={formatMessage(messages.passwordPlaceholder)}
            error={passwordError}
            onChange={this.handlePasswordOnChange}
          />

          <Error fieldName={'password'} apiErrors={get(apiErrors, 'json.errors.password')} />
        </FormElement>

        <FormElement>
          <TermsAndConditionsWrapper className={`${this.state.tacError && 'error'}`}>
            <Checkbox
              className="e2e-terms-and-conditions"
              value={this.state.tacAccepted}
              onChange={this.handleTaCAcceptedOnChange}
              disableLabelClick={true}
              label={
                <FormattedMessage
                  {...messages.acceptTermsAndConditions}
                  values={{ tacLink: <Link to="pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link> }}
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
              circularCorners={true}
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
    );
  }
}

export default injectIntl<Props>(Step1);
