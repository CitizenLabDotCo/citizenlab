import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import shallowCompare from 'utils/shallowCompare';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Select from 'components/UI/Select';
import { IStream } from 'utils/streams';
import { observeAreas, IAreas, IAreaData } from 'services/areas';
import { isValidEmail } from 'utils/validate';
import { signUp, signIn } from 'services/auth';
import { IOption } from 'typings';
import messages from './messages';
import styledComponents from 'styled-components';
const styled = styledComponents;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  color: #444;
  font-size: 36px;
  font-weight: 500;
  margin-bottom: 40px;
`;

const Form = styled.div`
  width: 100%;
  max-width: 550px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 44px;
`;

type Props = {
  opened: boolean;
  onSignedUp: () => void;
  intl: ReactIntl.InjectedIntl;
  tFunc: Function;
  locale: string;
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
};

interface IState {
  areas?: IOption[] | null;
  years?: IOption[];
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  password?: string | null;
  yearOfBirth?: IOption | null;
  gender?: IOption | null;
  area?: IOption | null;
  processing?: boolean;
  firstNameError?: string | null;
  lastNameError?: string | null;
  emailError?: string | null;
  passwordError?: string | null;
  signUpError?: string | null;
}

export default class SignUp extends React.PureComponent<Props, State> {
  private state$: Rx.Subject<IState>;
  private areas$: IStream<IAreas>;
  private subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
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
    };
    this.areas$ = observeAreas();
    this.state$ = new Rx.Subject();
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      this.state$
        .startWith(this.state)
        .scan((state, current) => ({ ...state, ...(_.isFunction(current) ? current(state) : current) }))
        .distinctUntilChanged((oldState, newState) => shallowCompare(oldState, newState))
        .subscribe(state => this.setState(state as State)),

      this.areas$.observable.subscribe((areas) => {
        this.state$.next({ areas: this.getOptions(areas) });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getOptions(list: IAreas) {
    const { tFunc } = this.props;

    return (list.data as IAreaData[]).map(item => ({
      value: item.id,
      label: tFunc(item.attributes.title_multiloc) as string,
    } as IOption));
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

  handleOnSubmit = async () => {
    const { onSignedUp } = this.props;
    const { formatMessage } = this.props.intl;
    const { firstName, lastName, email, password, yearOfBirth, gender, area } = this.state;

    if (!firstName || !lastName || !email || !isValidEmail(email) || !password) {
      let emailError: string | null = null;

      if (!email) {
        emailError = formatMessage(messages.noEmailError);
      } else if (!isValidEmail(email)) {
        emailError = formatMessage(messages.noValidEmailError);
      }

      this.state$.next({
        emailError,
        firstNameError: (!firstName ? formatMessage(messages.noFirstNameError) : null),
        lastNameError: (!lastName ? formatMessage(messages.noLastNameError) : null),
        passwordError: (!password ? formatMessage(messages.noPasswordError) : null)
      });
    } else {
      const selectedYearOfBirth = (yearOfBirth ? yearOfBirth.value as number : null);
      const selectedGender = (gender ? gender.value as ('male' | 'female') : null);
      const selectedAreaId = (area ? area.value as string : null);

      try {
        this.state$.next({ processing: true });
        await signUp(firstName, lastName, email, password, selectedGender, selectedYearOfBirth, selectedAreaId);
        await signIn(email, password);
        this.state$.next({ processing: false });
        onSignedUp();
      } catch (error) {
        this.state$.next({ processing: false, signUpError: formatMessage(messages.signUpError) });
      }
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
    } = this.state;
    const hasRequiredContent = [firstName, lastName, email, password].every((value) => _.isString(value) && !_.isEmpty(value));

    return (
      <Container>
        <Title>{formatMessage(messages.signUpTitle)}</Title>
        <Form>
          <FormElement>
            <Label value={formatMessage(messages.firstNameLabel)} htmlFor="firstName" />
            <Input
              id="firstName"
              type="text"
              value={firstName}
              placeholder={formatMessage(messages.firstNamePlaceholder)}
              error={firstNameError}
              onChange={this.handleFirstNameOnChange}
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
              disabled={!hasRequiredContent}
            />
            <Error text={signUpError} />
          </FormElement>
        </Form>
      </Container>
    );
  }
}
