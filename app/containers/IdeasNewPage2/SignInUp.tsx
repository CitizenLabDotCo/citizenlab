import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { stateStream, IStateStream } from 'services/state';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import Button from 'components/UI/Button';
import SignIn from 'containers/SignIn';
import SignUp from 'containers/SignUp';
import { IStream } from 'utils/streams';
import { observeCurrentTenant, ITenant } from 'services/tenant';
import messages from './messages';
import styled from 'styled-components';

const Container = styled.div`
  background: #f4f4f4;
`;

const Form = styled.div`
  width: 100%;
  max-width: 600px;
  display: 'flex';
  flex-direction: column;
  align-items: center;
  padding-right: 30px;
  padding-left: 30px;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 36px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 40px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 35px;
`;

type Props = {
  intl: ReactIntl.InjectedIntl;
  tFunc: Function;
  locale: string;
};

type State = {
  showSignIn: boolean;
  tenant: ITenant | null;
};

export default class SignInUp extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  tenant$: IStream<ITenant>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state$ = stateStream.observe<State>('SignInUp', { showSignIn: true, tenant: null });
    this.tenant$ = observeCurrentTenant();
    this.subscriptions = [];
  }

  componentWillMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state as State)),
      this.tenant$.observable.subscribe(tenant => this.state$.next({ tenant }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goBack = () => {
    console.log('go back');
  }

  goToSignUpForm = () => {

  }

  handleOnSignedIn = () => {
    console.log('sign in');
  }

  handleOnSignedUp = () => {
    console.log('sign up');
  }

  render() {
    const { showSignIn } = this.state;
    const { formatMessage } = this.props.intl;

    const signInForm = showSignIn && (
      <Form>
        <Button
          size="2"
          style="secondary"
          text={formatMessage(messages.goBack)}
          onClick={this.goBack}
          icon="arrow-back"
        />

        <Title>{formatMessage(messages.signInTitle)}</Title>

        <SignIn
          onSignedIn={this.handleOnSignedIn}
          intl={this.props.intl}
          locale={this.props.locale}
        />

        <div>-Or-</div>

        <div>
          <Button
            size="2"
            style="secondary"
            text={formatMessage(messages.createAnAccount)}
            onClick={this.goToSignUpForm}
            icon="arrow-back"
          />
        </div>
      </Form>
    );

    const signUpForm = !showSignIn && (
      <Form>
        <Button
          size="2"
          style="secondary"
          text={formatMessage(messages.goBack)}
          onClick={this.goBack}
          icon="arrow-back"
        />

        <Title>{formatMessage(messages.signUpTitle)}</Title>

        <SignUp
          onSignedUp={this.handleOnSignedUp}
          intl={this.props.intl}
          tFunc={this.props.tFunc}
          locale={this.props.locale}
        />
      </Form>
    );

    return (
      <Container>
        {signInForm}
        {signUpForm}
      </Container>
    );
  }
}
