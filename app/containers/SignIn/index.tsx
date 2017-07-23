import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import messages from './messages';
import { signIn } from 'services/auth';
import { isValidEmail } from 'utils/validate';
import styledComponents from 'styled-components';
const styled = styledComponents;

const Container = styled.div`
  background: #f2f2f2;
`;

const FormContainerOuter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 40px;
  padding-bottom: 100px;
`;

const Title = styled.h2`
  color: #444;
  font-size: 36px;
  font-weight: 500;
  margin-bottom: 40px;
`;

const FormContainerInner = styled.div`
  width: 100%;
  max-width: 550px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 44px;
`;

type Props = {
  opened: boolean;
  onSignedIn: () => void;
  intl: ReactIntl.InjectedIntl;
  locale: string;
};

type State = {
  email: string | null;
  password: string | null;
  processing: boolean;
  emailError: string | null;
  passwordError: string | null;
  signInError: string | null;
};

interface IState {
  email?: string | null;
  password?: string | null;
  processing?: boolean;
  emailError?: string | null;
  passwordError?: string | null;
  signInError?: string | null;
}

export default class SignIn extends React.PureComponent<Props, State> {
  private state$: Rx.Subject<IState>;
  private subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      email: null,
      password: null,
      processing: false,
      emailError: null,
      passwordError: null,
      signInError: null,
    };
    this.state$ = new Rx.Subject();
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      this.state$
        .startWith(this.state)
        .scan((prevState, updatedStateProps) => ({ ...prevState, ...updatedStateProps }))
        .subscribe(state => this.setState(state as State)),
    ];
  }

  handleEmailOnChange = (email) => {
    this.state$.next({ email, emailError: null, signInError: null });
  }

  handlePasswordOnChange = (password) => {
    this.state$.next({ password, passwordError: null, signInError: null });
  }

  handleOnSubmit = async () => {
    const { onSignedIn } = this.props;
    const { formatMessage } = this.props.intl;
    const { email, password } = this.state;

    if (!email || !isValidEmail(email) || !password) {
      let emailError: string | null = null;
      const passwordError = (!password ? formatMessage(messages.noPasswordError) : null);

      if (!email) {
        emailError = formatMessage(messages.noEmailError);
      } else if (!isValidEmail(email)) {
        emailError = formatMessage(messages.noValidEmailError);
      }

      this.state$.next({ emailError, passwordError });
    } else {
      try {
        this.state$.next({ processing: true });
        await signIn(email, password);
        this.state$.next({ processing: false });
        onSignedIn();
      } catch (error) {
        this.state$.next({ processing: false, signInError: formatMessage(messages.signInError) });
      }
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { email, password, processing, emailError, passwordError, signInError } = this.state;
    const hasAllRequiredContent = [email, password].every((value) => _.isString(value) && !_.isEmpty(value));

    return (
      <Container>
        <FormContainerOuter>
          <Title>{formatMessage(messages.signInTitle)}</Title>

          <FormContainerInner>
            <Label value={formatMessage(messages.emailLabel)} htmlFor="email" />
            <FormElement>
              <Input
                type="email"
                id="email"
                value={email}
                placeholder={formatMessage(messages.emailPlaceholder)}
                error={emailError}
                onChange={this.handleEmailOnChange}
              />
            </FormElement>

            <Label value={formatMessage(messages.passwordLabel)} htmlFor="password" />
            <FormElement>
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
              <Button
                size="2"
                loading={processing}
                text={formatMessage(messages.submit)}
                onClick={this.handleOnSubmit}
                disabled={!hasAllRequiredContent}
              />
              <Error text={signInError} />
            </FormElement>
          </FormContainerInner>
        </FormContainerOuter>
      </Container>
    );
  }
}
