import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Select from 'components/UI/Select';
import { IStream } from 'utils/streams';
import { stateStream, IStateStream } from 'services/state';
import { observeAreas, IAreas, IAreaData } from 'services/areas';
import { isValidEmail } from 'utils/validate';
import { signUp, signIn, getAuthUser } from 'services/auth';
import { connect } from 'react-redux';
import { LOAD_CURRENT_USER_SUCCESS } from 'utils/auth/constants';
import { IOption } from 'typings';
import messages from './messages';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const Form = styled.div`
  width: 100%;
  position: relative;
  -webkit-backface-visibility: hidden;
  will-change: auto;

  &.form-enter {
    transform: translateX(100vw);
    position: absolute;
    will-change: transform;

    &.step1 {
      transform: translateX(-100vw);
    }

    &.form-enter-active {
      transform: translateX(0);
      transition: transform 600ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.form-exit {
    transform: translateX(0);
    will-change: transform;

    &.form-exit-active {
      transform: translateX(100vw);
      transition: transform 600ms cubic-bezier(0.165, 0.84, 0.44, 1);

      &.step1 {
        transform: translateX(-100vw);
      }
    }
  }
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;

type Props = {
  dispatch?: (arg: any) => any;
  intl: ReactIntl.InjectedIntl;
  tFunc: Function;
  locale: string;
  onSignedUp: () => void;
};

type State = {
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

@connect()
export default class SignUp extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  areas$: IStream<IAreas>;
  subscriptions: Rx.Subscription[];
  firstNameInputElement: HTMLInputElement | null;

  constructor() {
    super();
    this.areas$ = observeAreas();
    this.state$ = stateStream.observe<State>('SignUp', {
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
    });
    this.subscriptions = [];
  }

  componentWillMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),
      this.areas$.observable.subscribe(areas => this.state$.next({ areas: this.getOptions(areas) })),
    ];
  }

  componentDidMount() {
    this.firstNameInputElement && this.firstNameInputElement.focus();
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getOptions(list: IAreas | null) {
    if (list) {
      return (list.data as IAreaData[]).map(item => ({
        value: item.id,
        label: this.props.tFunc(item.attributes.title_multiloc) as string,
      } as IOption));
    }

    return null;
  }

  handleFirstNameInputSetRef = (element: HTMLInputElement) => {
    this.firstNameInputElement = element;
  }

  handleFirstNameOnChange = (firstName: string) => {
    this.state$.next({ firstName, firstNameError: null, signUpError: null });
  }

  handleLastNameOnChange = (lastName: string) => {
    this.state$.next({ lastName, lastNameError: null, signUpError: null });
  }

  handleEmailOnChange = (email: string) => {
    this.state$.next({ email, emailError: null, signUpError: null });
  }

  handlePasswordOnChange = (password: string) => {
    this.state$.next({ password, passwordError: null, signUpError: null });
  }

  handleYearOfBirthOnChange = (yearOfBirth: IOption) => {
    this.state$.next({ yearOfBirth });
  }

  handleGenderOnChange = (gender: IOption) => {
    this.state$.next({ gender });
  }

  handleAreaOnChange = (area: IOption) => {
    this.state$.next({ area });
  }

  handleOnContinue = () => {
    const { firstName, lastName, email, password } = this.state;
    const { formatMessage } = this.props.intl;
    const hasEmailError = (!email || !isValidEmail(email));
    const emailError = (hasEmailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const firstNameError = (!firstName ? formatMessage(messages.noFirstNameError) : null);
    const lastNameError = (!lastName ? formatMessage(messages.noLastNameError) : null);
    const passwordError = (!password ? formatMessage(messages.noPasswordError) : null);
    const hasErrors = [emailError, firstNameError, lastNameError, passwordError].some(error => error !== null);
    this.state$.next({ emailError, firstNameError, lastNameError, passwordError, showStep1: hasErrors });
  }

  handleOnSubmit = async () => {
    const { onSignedUp, dispatch } = this.props;
    const { formatMessage } = this.props.intl;
    const { firstName, lastName, email, password, yearOfBirth, gender, area } = this.state;

    if (firstName && lastName && email && password) {
      try {
        const selectedYearOfBirth = (yearOfBirth ? yearOfBirth.value : null);
        const selectedGender = (gender ? gender.value : null);
        const selectedAreaId = (area ? area.value : null);
        const locale = this.props.locale;

        this.state$.next({ processing: true });
        await signUp(firstName, lastName, email, password, locale, selectedGender, selectedYearOfBirth, selectedAreaId);
        await signIn(email, password);
        getAuthUser();

        this.state$.next({ processing: false });
        onSignedUp();
      } catch (error) {
        const signUpError = formatMessage(messages.signUpError);
        this.state$.next({ signUpError, processing: false });
      }
    } else {
      console.log('error');
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
        <Form className="step1">
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

          <Button
            size="2"
            text={formatMessage(messages.continue)}
            onClick={this.handleOnContinue}
          />
        </Form>
      </CSSTransition>
    ));

    const step2 = (!showStep1 && (
      <CSSTransition classNames="form" timeout={timeout}>
        <Form>
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
                value: 'female',
                label: formatMessage(messages.male),
              }, {
                value: 'male',
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
            <Button
              size="2"
              loading={processing}
              text={formatMessage(messages.submit)}
              onClick={this.handleOnSubmit}
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
      </Container>
    );
  }
}
