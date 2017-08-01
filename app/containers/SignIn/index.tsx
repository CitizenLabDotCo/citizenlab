import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import messages from './messages';
import { stateStream, IStateStream } from 'services/state';
import { signIn } from 'services/auth';
import { isValidEmail } from 'utils/validate';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Banner = styled.div`
  width: 511px;
  height: 712px;
  border-radius: 5px;
  background-color: #fff;
`;

const Form = styled.div`
  width: 100%;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;

type Props = {
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

export default class SignIn extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state$ = stateStream.observe<State>('SignIn', {
      email: null,
      password: null,
      processing: false,
      emailError: null,
      passwordError: null,
      signInError: null,
    });
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state as State))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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

    const hasEmailError = (!email || !isValidEmail(email));
    const emailError = (hasEmailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const passwordError = (!password ? formatMessage(messages.noPasswordError) : null);

    this.state$.next({ emailError, passwordError });

    if (!emailError && !passwordError && email && password) {
      try {
        this.state$.next({ processing: true });
        await signIn(email, password);
        this.state$.next({ processing: false });
        onSignedIn();
      } catch (error) {
        const signInError = formatMessage(messages.signInError);
        this.state$.next({ signInError, processing: false });
      }
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { email, password, processing, emailError, passwordError, signInError } = this.state;
    const hasAllRequiredContent = [email, password].every(value => _.isString(value) && !_.isEmpty(value));

    return (
      <Container>
        <Form>
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
            <Button
              size="2"
              loading={processing}
              text={formatMessage(messages.submit)}
              onClick={this.handleOnSubmit}
              disabled={!hasAllRequiredContent}
            />
            <Error text={signInError} />
          </FormElement>
        </Form>
      </Container>
    );
  }
}
