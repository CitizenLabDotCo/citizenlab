import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import { IOption } from 'typings';
import { Link } from 'react-router';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Select from 'components/UI/Select';

// utils
import { isValidEmail } from 'utils/validate';

// services
import { areasStream, IAreas, IAreaData } from 'services/areas';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { signUp } from 'services/auth';

// legacy redux
import { LOAD_CURRENT_USER_SUCCESS } from 'utils/auth/constants';

// i18n
import { getLocalized } from 'utils/i18n';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import { darken } from 'polished';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const Form = styled.form`
  width: 100%;
  height: auto;
  max-width: 360px;
  position: relative;
  -webkit-backface-visibility: hidden;
  will-change: auto;

  &.form-enter {
    opacity: 0.01;
    position: absolute;
    will-change: opacity, transform;

    &.step1 {
      transform: translateX(-100px);
    }

    &.step2 {
      transform: translateX(100px);
    }

    &.form-enter-active {
      opacity: 1;
      transform: translateX(0);
      transition: opacity 600ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  transform 600ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.form-exit {
    opacity: 1;
    will-change: opacity, transform;

    &.step1 {
      height: 447px;
    }

    &.step2 {
      height: 340px;
    }

    &.form-exit-active {
      opacity: 0.01;
      transition: opacity 600ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  transform 600ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  height 600ms cubic-bezier(0.165, 0.84, 0.44, 1);

      &.step1 {
        height: 340px;
        transform: translateX(-100px);
      }

      &.step2 {
        height: 447px;
        transform: translateX(100px);
      }
    }
  }
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const StyledButton = styled(Button)`;
  margin-top: 0px;
`;

const Separator = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  position: relative;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const SeparatorLine = styled.div`
  width: 100%;
  height: 1px;
  background: transparent;
  border-bottom: solid 1px #ccc;
`;

const SeparatorTextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const SeparatorText = styled.div`
  width: 54px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;

  span {
    color: #999;
    font-size: 17px;
  }
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FooterText = styled.div`
  color: #888;
  font-size: 17px;
  line-height: 21px;
  font-weight: 400;
  margin-top: 0px;
  margin-bottom: 0px;

  span {
    margin-right: 5px;
  }
`;

const FooterLink = styled.span`
  color: ${(props) => props.theme.colorMain};

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
    cursor: pointer;
  }
`;

type Props = {
  onSignedUp: () => void;
  goToSignInForm?: () => void;
};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  areas: IOption[] | null;
  years: IOption[];
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  password: string | null;
  yearOfBirth: IOption | null;
  gender: IOption | null;
  area: IOption | null;
  processing: boolean;
  firstNameError: string | null;
  lastNameError: string | null;
  emailError: string | null;
  passwordError: string | null;
  signUpError: string | null;
  showStep1: boolean;
};

class SignUp extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];
  firstNameInputElement: HTMLInputElement | null;

  constructor() {
    super();
    this.state = {
      locale: null,
      currentTenant: null,
      areas: null,
      years: [...Array(118).keys()].map((i) => ({ value: i + 1900, label: `${i + 1900}` })),
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      yearOfBirth: null,
      gender: null,
      area: null,
      processing: false,
      firstNameError: null,
      lastNameError: null,
      emailError: null,
      passwordError: null,
      signUpError: null,
      showStep1: true
    };
    this.subscriptions = [];
    this.firstNameInputElement = null;
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const areas$ = areasStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        areas$
      ).subscribe(([locale, currentTenant, areas]) => {
        this.setState({
          locale,
          currentTenant,
          areas: this.getOptions(areas, locale, currentTenant)
        });
      })
    ];
  }

  componentDidMount() {
    this.firstNameInputElement && this.firstNameInputElement.focus();
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getOptions(list: IAreas, locale: string, currentTenant: ITenant) {
    if (list && locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      return (list.data as IAreaData[]).map(item => ({
        value: item.id,
        label: getLocalized(item.attributes.title_multiloc, locale, currentTenantLocales),
      } as IOption));
    }

    return null;
  }

  handleFirstNameInputSetRef = (element: HTMLInputElement) => {
    this.firstNameInputElement = element;
  }

  handleFirstNameOnChange = (firstName: string) => {
    this.setState({ firstName, firstNameError: null, signUpError: null });
  }

  handleLastNameOnChange = (lastName: string) => {
    this.setState({ lastName, lastNameError: null, signUpError: null });
  }

  handleEmailOnChange = (email: string) => {
    this.setState({ email, emailError: null, signUpError: null });
  }

  handlePasswordOnChange = (password: string) => {
    this.setState({ password, passwordError: null, signUpError: null });
  }

  handleYearOfBirthOnChange = (yearOfBirth: IOption) => {
    this.setState({ yearOfBirth });
  }

  handleGenderOnChange = (gender: IOption) => {
    this.setState({ gender });
  }

  handleAreaOnChange = (area: IOption) => {
    this.setState({ area });
  }

  handleOnContinue = (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { firstName, lastName, email, password } = this.state;
    const { formatMessage } = this.props.intl;
    const hasEmailError = (!email || !isValidEmail(email));
    const emailError = (hasEmailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const firstNameError = (!firstName ? formatMessage(messages.noFirstNameError) : null);
    const lastNameError = (!lastName ? formatMessage(messages.noLastNameError) : null);
    const passwordError = (!password ? formatMessage(messages.noPasswordError) : null);
    const hasErrors = [emailError, firstNameError, lastNameError, passwordError].some(error => error !== null);

    this.setState({ emailError, firstNameError, lastNameError, passwordError, showStep1: hasErrors });
  }

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { onSignedUp } = this.props;
    const { formatMessage } = this.props.intl;
    const { locale, firstName, lastName, email, password, yearOfBirth, gender, area } = this.state;

    if (locale && firstName && lastName && email && password) {
      try {
        const selectedYearOfBirth = (yearOfBirth ? yearOfBirth.value : null);
        const selectedGender = (gender ? gender.value : null);
        const selectedAreaId = (area ? area.value : null);

        this.setState({ processing: true });
        await signUp(firstName, lastName, email, password, locale, selectedGender, selectedYearOfBirth, selectedAreaId);
        this.setState({ processing: false });
        onSignedUp();
      } catch (error) {
        const signUpError = formatMessage(messages.signUpError);
        this.setState({ signUpError, processing: false });
      }
    } else {
      console.log('error');
    }
  }

  goToSignInForm = (event) => {
    event.preventDefault();

    if (_.isFunction(this.props.goToSignInForm)) {
      this.props.goToSignInForm();
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const {
      areas,
      years,
      firstName,
      lastName,
      email,
      password,
      yearOfBirth,
      gender,
      area,
      processing,
      firstNameError,
      lastNameError,
      emailError,
      passwordError,
      signUpError,
      showStep1
    } = this.state;
    const timeout = 600;

    const step1 = (showStep1 && (
      <CSSTransition classNames="form" timeout={timeout}>
        <Form id="e2e-signup-step1" onSubmit={this.handleOnContinue} noValidate={true} className="step1">
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
          </FormElement>

          <FormElement>
            <StyledButton
              size="3"
              text={formatMessage(messages.continue)}
              onClick={this.handleOnContinue}
              circularCorners={true}
            />
          </FormElement>
        </Form>
      </CSSTransition>
    ));

    const step2 = (!showStep1 && (
      <CSSTransition classNames="form" timeout={timeout}>
        <Form id="e2e-signup-step2" onSubmit={this.handleOnSubmit} noValidate={true} className="step2">
          <FormElement>
            <Label value={formatMessage(messages.yearOfBirthLabel)} htmlFor="yearOfBirth" />
            <Select
              clearable={true}
              searchable={true}
              value={yearOfBirth}
              placeholder={formatMessage(messages.yearOfBirthPlaceholder)}
              options={years}
              onChange={this.handleYearOfBirthOnChange}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.genderLabel)} htmlFor="gender" />
            <Select
              clearable={true}
              value={gender}
              placeholder={formatMessage(messages.genderPlaceholder)}
              options={[{
                value: 'male',
                label: formatMessage(messages.male),
              }, {
                value: 'female',
                label: formatMessage(messages.female),
              }, {
                value: 'unspecified',
                label: formatMessage(messages.unspecified),
              }]}
              onChange={this.handleGenderOnChange}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.areaLabel)} htmlFor="area" />
            <Select
              clearable={true}
              value={area}
              placeholder={formatMessage(messages.areaPlaceholder)}
              options={areas}
              onChange={this.handleAreaOnChange}
            />
          </FormElement>

          <FormElement>
            <StyledButton
              size="3"
              loading={processing}
              text={formatMessage(messages.submit)}
              onClick={this.handleOnSubmit}
              circularCorners={true}
            />
            <Error text={signUpError} />
          </FormElement>
        </Form>
      </CSSTransition>
    ));

    return (
      <Container>
        <TransitionGroup>
          {step1}
          {step2}
        </TransitionGroup>

        <Separator>
          <SeparatorLine />
          <SeparatorTextContainer>
            <SeparatorText>
              <span><FormattedMessage {...messages.or} /></span>
            </SeparatorText>
          </SeparatorTextContainer>
        </Separator>

        <Footer>
          <FooterText>
            <span>{formatMessage(messages.alreadyHaveAnAccount)}</span>
            <FooterLink onClick={this.goToSignInForm}>{formatMessage(messages.logIn)}</FooterLink>
          </FooterText>

          {/*
          <Button
            size="3"
            style="secondary-outlined"
            text={formatMessage(messages.logIn)}
            fullWidth={true}
            onClick={this.goToSignInForm}
            circularCorners={true}
          />
          */}
        </Footer>
      </Container>
    );
  }
}

export default injectIntl<Props>(SignUp);
