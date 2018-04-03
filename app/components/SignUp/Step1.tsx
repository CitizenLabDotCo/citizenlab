import * as React from 'react';
import { set, keys, difference, get } from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { browserHistory, Link } from 'react-router';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

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
  onCompleted: (userId: string) => void;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  hasCustomFields: boolean;
  firstName: string | null;
  lastName: string | null;
  email: string | null | undefined;
  password: string | null;
  processing: boolean;
  firstNameError: string | null;
  lastNameError: string | null;
  emailError: string | null;
  passwordError: string | null;
  localeError: string | null;
  unknownError: string | null;
  apiErrors: API.ErrorResponse | null;
};

class Step1 extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];
  firstNameInputElement: HTMLInputElement | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      hasCustomFields: false,
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      processing: false,
      firstNameError: null,
      lastNameError: null,
      emailError: null,
      passwordError: null,
      localeError: null,
      unknownError: null,
      apiErrors: null
    };
    this.subscriptions = [];
    this.firstNameInputElement = null;
  }

  componentDidMount() {
    const location = browserHistory.getCurrentLocation();
    const token: string | null = get(location, 'query.token', null);
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const customFieldsSchemaForUsersStream$ = customFieldsSchemaForUsersStream().observable;
    const invitedUser$ = (token ? userByInviteStream(token).observable : Rx.Observable.of(null));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        customFieldsSchemaForUsersStream$,
        invitedUser$
      ).subscribe(([locale, currentTenant, customFieldsSchema, invitedUser]) => {
        this.setState((state) => ({
          locale,
          currentTenant,
          firstName: (invitedUser ? invitedUser.data.attributes.first_name : state.firstName),
          lastName: (invitedUser ? invitedUser.data.attributes.last_name : state.lastName),
          email: (invitedUser ? invitedUser.data.attributes.email : state.email),
          hasCustomFields: hasCustomFields(customFieldsSchema, locale)
        }));
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleFirstNameInputSetRef = (element: HTMLInputElement) => {
    if (element) {
      this.firstNameInputElement = element;
      this.firstNameInputElement.focus();
    }
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

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { formatMessage } = this.props.intl;
    const { locale, currentTenant, hasCustomFields, firstName, lastName, email, password } = this.state;
    const location = browserHistory.getCurrentLocation();
    const token: string | null = get(location, 'query.token', null);
    const currentTenantLocales = currentTenant ? currentTenant.data.attributes.settings.core.locales : [];
    const hasEmailError = (!email || !isValidEmail(email));
    const emailError = (hasEmailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const firstNameError = (!firstName ? formatMessage(messages.noFirstNameError) : null);
    const lastNameError = (!lastName ? formatMessage(messages.noLastNameError) : null);
    const localeError = (!currentTenantLocales.some(currentTenantLocale => locale === currentTenantLocale) ? formatMessage(messages.noValidLocaleError) : null);

    let passwordError: string | null = null;

    if (!password) {
      passwordError = formatMessage(messages.noPasswordError);
    } else if (password.length < 8) {
      passwordError = formatMessage(messages.noValidPasswordError);
    }

    const hasErrors = [emailError, firstNameError, lastNameError, passwordError, localeError].some(error => error !== null);

    this.setState({ emailError, firstNameError, lastNameError, passwordError, localeError });

    if (!hasErrors && firstName && lastName && email && password && locale) {
      try {
        this.setState({
          processing: true,
          unknownError: null
        });

        const user = await signUp(firstName, lastName, email, password, locale, token);

        if (!hasCustomFields) {
          await completeRegistration({});
        }

        this.setState({ processing: false });
        this.props.onCompleted(user.data.id);
      } catch (errors) {
        this.setState({
          processing: false,
          apiErrors: errors
        });
      }
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const {
      firstName,
      lastName,
      email,
      password,
      processing,
      firstNameError,
      lastNameError,
      emailError,
      passwordError,
      apiErrors
    } = this.state;

    let unknownApiError: string | null = null;

    if (apiErrors && apiErrors.json.errors) {
      const fieldKeys = keys(apiErrors.json.errors);

      if (difference(fieldKeys, ['first_name', 'last_name', 'email', 'password', 'locale']).length > 0) {
        unknownApiError = formatMessage(messages.unknownError);
      }
    }

    return (
      <Form id="e2e-signup-step1" onSubmit={this.handleOnSubmit} noValidate={true}>
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
          <ButtonWrapper>
            <Button
              id="e2e-signup-step1-button"
              size="1"
              processing={processing}
              text={formatMessage(messages.signUp)}
              onClick={this.handleOnSubmit}
              circularCorners={true}
            />
            <AlreadyHaveAnAccount to="/sign-in">
              <FormattedMessage {...messages.alreadyHaveAnAccount} />
            </AlreadyHaveAnAccount>
          </ButtonWrapper>
        </FormElement>

        <Error text={unknownApiError} />
      </Form>
    );
  }
}

export default injectIntl<Props>(Step1);
