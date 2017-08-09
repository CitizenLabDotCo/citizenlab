import * as React from 'react';
import * as Rx from 'rxjs/Rx';
// import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { stateStream, IStateStream } from 'services/state';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import Button from 'components/UI/Button';
import SignIn from 'containers/SignIn';
import SignUp from 'containers/SignUp';
import { IStream } from 'utils/streams';
import { observeCurrentTenant, ITenant } from 'services/tenant';
import messages from './messages';
import styled from 'styled-components';

const Container = styled.div`
  background: #f2f2f2;
`;

const PageContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  min-height: calc(100vh - 105px);
  padding-bottom: 60px;
  padding-left: 30px;
  padding-right: 30px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  display: flex;
`;

const Banner = styled.div`
	width: 480px;
	height: 600px;
	border-radius: 5px;
  background-color: #fff;
  margin-right: 110px;
  padding: 50px;
  position: relative;
`;

const LogoContainer = styled.div`
  height: 60px;
`;

const Logo = styled.img`
  width: auto;
  height: 100%;
`;

const Slogan1 = styled.div`
  color: ${props => props.theme.color.main || '#333'};
  font-size: 32px;
  line-height: 38px;
  font-weight: 500;
  margin-top: 80px;
`;

const Slogan2 = styled.div`
  color: #f2f2f2;
  font-size: 135px;
  line-height: 113px;
  font-weight: 800;
  position: absolute;
  bottom: 25px;
  left: 20px;
  right: 20px;
`;

const Forms = styled.div`
  flex: 1;
`;

const FormContainer = styled.div`
  background: #f2f2f2;
  position: relative;
  -webkit-backface-visibility: hidden;
  will-change: opacity;

  &.form-enter {
    position: absolute;
    top: 0;
    z-index: 2;
    opacity: 0.01;

    &.form-enter-active {
      opacity: 1;
      transition: opacity 500ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.form-exit {
    position: absolute;
    top: 0;
    z-index: 2;
    opacity: 1;

    &.form-exit-active {
      opacity: 0.01;
      transition: opacity 500ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

const Form = styled.div`
  width: 100%;
  max-width: 600px;
  /* display: flex; */
  /* flex-direction: column; */
  /* align-items: center; */
  /* padding-right: 30px; */
  /* padding-left: 30px; */
  /* margin-left: auto; */
  /* margin-right: auto; */
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

type Props = {
  intl: ReactIntl.InjectedIntl;
  tFunc: Function;
  locale: string;
  onGoBack: () => void;
  onSignInUpCompleted: () => void;
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
    this.state$ = stateStream.observe<State>('IdeasNewPage2/SignInUp', { showSignIn: true, tenant: null });
    this.tenant$ = observeCurrentTenant();
    this.subscriptions = [];
  }

  componentWillMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),
      this.tenant$.observable.subscribe(tenant => this.state$.next({ tenant }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goBack = () => {
    this.props.onGoBack();
  }

  goToSignUpForm = () => {
    window.scrollTo(0, 0);
    this.state$.next({ showSignIn: false });
  }

  goToSignInForm = () => {
    window.scrollTo(0, 0);
    this.state$.next({ showSignIn: true });
  }

  handleOnSignedIn = () => {
    this.props.onSignInUpCompleted();
  }

  handleOnSignedUp = () => {
    this.props.onSignInUpCompleted();
  }

  render() {
    const { showSignIn, tenant } = this.state;
    const logo = tenant && tenant.data.attributes.logo.large;
    const { formatMessage } = this.props.intl;
    const timeout = 500;

    const signIn = showSignIn && (
      <CSSTransition classNames="page" timeout={timeout}>
        <FormContainer>
          <Form>
            <Button
              size="1"
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

            {/*
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
            */}
          </Form>
        </FormContainer>
      </CSSTransition>
    );

    const signUp = !showSignIn && (
      <CSSTransition classNames="form" timeout={timeout}>
        <FormContainer>
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
        </FormContainer>
      </CSSTransition>
    );

    return (
      <Container>
        <PageContainer>
          <Banner>
            <LogoContainer>
              <Logo src={logo as string} />
              <Slogan1>We need your opinion to create a better city!</Slogan1>
              <Slogan2>Co-Create</Slogan2>
            </LogoContainer>
          </Banner>
          <Forms>
            <TransitionGroup>
              {signIn}
              {signUp}
            </TransitionGroup>
          </Forms>
        </PageContainer>
      </Container>
    );
  }
}
