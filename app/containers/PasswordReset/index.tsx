import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Success from 'components/UI/Success';
import { stateStream, IStateStream } from 'services/state';
import { sendPasswordResetMail } from 'services/auth';
import { isValidEmail } from 'utils/validate';
import messages from './messages';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const Form = styled.div`
  width: 100%;
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 38px;
  line-height: 44px;
  font-weight: 500;
  text-align: left;
  margin-top: 50px;
  margin-bottom: 35px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 25px;
`;

type Props = {
  intl: ReactIntl.InjectedIntl;
  tFunc: Function;
  locale: string;
  onExit?: () => void;
};

export type State = {
  email: string | null;
  emailError: boolean;
  submitError: boolean;
  processing: boolean;
  success: boolean;
};

export const namespace = 'PasswordReset/index';

export default class PasswordReset extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];
  emailInputElement: HTMLInputElement | null;

  constructor() {
    super();
    this.state$ = stateStream.observe<State>(namespace, namespace, {
      email: null,
      emailError: false,
      submitError: false,
      processing: false,
      success: false
    });
    this.subscriptions = [];
    this.emailInputElement = null;
  }

  componentWillMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state))
    ];
  }

  componentDidMount() {
    this.emailInputElement && this.emailInputElement.focus();
  }

  componentWillUnmount() {
    _(this.subscriptions).forEach(subscription => subscription.unsubscribe());
  }

  validate = (email: string | null) => {
    const { formatMessage } = this.props.intl;
    const emailError = (!email || !isValidEmail(email));
    emailError && this.emailInputElement && this.emailInputElement.focus();
    this.state$.next({ emailError });
    return (!emailError);
  }

  handleEmailOnChange = () => {
    this.state$.next({ emailError: false });
  }

  handleEmailInputSetRef = (element: HTMLInputElement) => {
    this.emailInputElement = element;
  }

  handleOnSubmit = () => {
    const { email } = this.state;

    if (this.validate(email) && email) {
      sendPasswordResetMail(email).then(() => {
        this.state$.next({ success: true });
        setTimeout(() => this.state$.next({ success: false }), 8000);
      }).catch((error) => {
        this.state$.next({ success: false, submitError: true });
      });
    }
  }

  handleOnGoBack = () => {
    !_.isUndefined(this.props.onExit) && this.props.onExit();
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { email, emailError, submitError, processing, success } = this.state;
    const emailErrorMessage = (emailError ? (!email ? formatMessage(messages.noEmailError) : formatMessage(messages.noValidEmailError)) : null);
    const submitErrorMessage = (submitError ? formatMessage(messages.submitError) : null);
    const successMessage = (success ? formatMessage(messages.successMessage) : null);

    return (
      <Container>
        <Form>
          <Title>{formatMessage(messages.title)}</Title>

          <FormElement name="titleInput">
            <Label value={formatMessage(messages.emailLabel)} htmlFor="email" />
            <Input
              id="email"
              type="text"
              value={email}
              placeholder={formatMessage(messages.emailPlaceholder)}
              error={emailErrorMessage}
              onChange={this.handleEmailOnChange}
              setRef={this.handleEmailInputSetRef}
            />
          </FormElement>

          <FormElement>
            <Button
              size="2"
              loading={processing}
              text={formatMessage(messages.send)}
              onClick={this.handleOnSubmit}
            />
            <Error text={submitErrorMessage} />
            <Success text={successMessage} />
          </FormElement>
        </Form>
      </Container>
    );
  }
}
