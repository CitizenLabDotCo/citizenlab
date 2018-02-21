import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { Link } from 'react-router';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// utils
import { isValidEmail } from 'utils/validate';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { signUp } from 'services/auth';

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
  firstName: string | null;
  lastName: string | null;
  email: string | null;
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
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.firstNameInputElement && this.firstNameInputElement.focus();

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$
      ).subscribe(([locale, currentTenant]) => {
        this.setState({ locale, currentTenant });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleFirstNameInputSetRef = (element: HTMLInputElement) => {
    this.firstNameInputElement = element;
  }

  handleFirstNameOnChange = (firstName: string) => {
    this.setState((state) => ({
      firstName,
      firstNameError: null,
      unknownError: null,
      apiErrors: (state.apiErrors ? _.set(state.apiErrors, 'json.errors.first_name', null) : null)
    }));
  }

  handleLastNameOnChange = (lastName: string) => {
    this.setState((state) => ({
      lastName,
      lastNameError: null,
      unknownError: null,
      apiErrors: (state.apiErrors ? _.set(state.apiErrors, 'json.errors.last_name', null) : null)
    }));
  }

  handleEmailOnChange = (email: string) => {
    this.setState((state) => ({
      email,
      emailError: null,
      unknownError: null,
      apiErrors: (state.apiErrors ? _.set(state.apiErrors, 'json.errors.email', null) : null)
    }));
  }

  handlePasswordOnChange = (password: string) => {
    this.setState((state) => ({
      password,
      passwordError: null,
      unknownError: null,
      apiErrors: (state.apiErrors ? _.set(state.apiErrors, 'json.errors.password', null) : null)
    }));
  }

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { formatMessage } = this.props.intl;
    const { locale, currentTenant, firstName, lastName, email, password } = this.state;
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

        const user = await signUp(firstName, lastName, email, password, locale);
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
      const keys = _.keys(apiErrors.json.errors);

      if (_.difference(keys, ['first_name', 'last_name', 'email', 'password', 'locale']).length > 0) {
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

          <Error fieldName={'first_name'} apiErrors={_.get(apiErrors, 'json.errors.first_name')} />
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

          <Error fieldName={'last_name'} apiErrors={_.get(apiErrors, 'json.errors.last_name')} />
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

          <Error fieldName={'email'} apiErrors={_.get(apiErrors, 'json.errors.email')} />
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

          <Error fieldName={'password'} apiErrors={_.get(apiErrors, 'json.errors.password')} />
        </FormElement>

        <FormElement>
          <ButtonWrapper>
            <Button
              id="e2e-signup-step1-button"
              size="2"
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
