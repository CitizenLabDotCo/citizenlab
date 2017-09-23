import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// libraries
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// components
import PasswordReset from 'containers/PasswordReset';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import SignIn from 'components/SignIn';
import SignUp from 'components/SignUp';
import SignInUpBanner from 'components/SignInUpBanner';

// services
import { currentTenantStream, ITenant } from 'services/tenant';

// utils
import { IStream } from 'utils/streams';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  border-top: solid 1px #ddd;
  background: #f8f8f8;
  overflow: hidden;
  position: relative;
`;

const Section = styled.div`
  flex: 1;
  height: 100%;
`;

const Left = Section.extend`
  width: 50vw;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;

  ${media.notDesktop`
    display: none;
  `}
  `;

const Right = Section.extend`
  width: 100%;
  overflow-y: scroll;

  ${media.desktop`
    padding-left: 50vw;
  `}
`;

const RightInner = styled.div`
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 40px;
  padding-bottom: 100px;
  padding-left: 30px;
  padding-right: 30px;
`;

const Forms = styled.div`
  flex: 1;
`;

const StyledTransitionGroup = styled(TransitionGroup) `
  position: relative;
`;

const FormContainer = styled.div`
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
      transition: opacity 10ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.form-exit {
    position: absolute;
    top: 0;
    z-index: 2;
    opacity: 1;

    &.form-exit-active {
      opacity: 0.01;
      transition: opacity 10ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

const GoBackContainer = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: -3px;
  margin-bottom: 30px;
  cursor: pointer;

  &:hover {
    svg {
      fill: #000;
    }

    span {
      color: #000;
    }
  }

  svg {
    fill: #999;
    height: 26px;
  }

  span {
    color: #999;
    font-size: 18px;
    font-weight: 400;
    padding-left: 1px;
  }
`;

const Form = styled.div`
  width: 100%;
  max-width: 600px;
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 36px;
  line-height: 42px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 35px;
`;

type Props = {
  onGoBack?: () => void;
  onSignInUpCompleted: () => void;
};

type State = {
  show: 'signIn' | 'signUp' | 'passwordReset';
  currentTenant: ITenant | null;
};

class SignInUp extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      show: props.show || 'signIn',
      currentTenant: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe(currentTenant => this.setState({ currentTenant }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goBack = () => {
    this.props.onGoBack && this.props.onGoBack();
  }

  goToSignUpForm = () => {
    // window.scrollTo(0, 0);
    this.setState({ show: 'signUp' });
  }

  goToSignInForm = () => {
    // window.scrollTo(0, 0);
    this.setState({ show: 'signIn' });
  }

  goToPasswordResetForm = () => {
    // window.scrollTo(0, 0);
    this.setState({ show: 'passwordReset' });
  }

  handleOnSignedIn = () => {
    this.props.onSignInUpCompleted();
  }

  handleOnSignedUp = () => {
    this.props.onSignInUpCompleted();
  }

  render() {
    const { show, currentTenant } = this.state;
    const logo = (currentTenant ? currentTenant.data.attributes.logo.large : null);
    const { formatMessage } = this.props.intl;
    const { onGoBack } = this.props;
    const timeout = 10;

    const signIn = (show === 'signIn' && (
      <CSSTransition classNames="page" timeout={timeout}>
        <FormContainer>
          <Form>
            <Title>{formatMessage(messages.signInTitle)}</Title>
            <SignIn
              onSignedIn={this.handleOnSignedIn}
              onForgotPassword={this.goToPasswordResetForm}
              goToSignUpForm={this.goToSignUpForm}
            />
          </Form>
        </FormContainer>
      </CSSTransition>
    ));

    const signUp = (show === 'signUp' && (
      <CSSTransition classNames="form" timeout={timeout}>
        <FormContainer>
          <Form>
            <Title>{formatMessage(messages.signUpTitle)}</Title>
            <SignUp
              onSignedUp={this.handleOnSignedUp}
              goToSignInForm={this.goToSignInForm}
            />
          </Form>
        </FormContainer>
      </CSSTransition>
    ));

    const passwordReset = (show === 'passwordReset' && (
      <CSSTransition classNames="form" timeout={timeout}>
        <FormContainer>
          <PasswordReset onExit={this.goToSignInForm} />
        </FormContainer>
      </CSSTransition>
    ));

    return (
      <Container>
        <Left>
          <SignInUpBanner />
        </Left>
        <Right>
          <RightInner>
            {onGoBack &&
              <GoBackContainer onClick={this.goBack}>
                <Icon name="arrow-back" />
                <span><FormattedMessage {...messages.goBack} /></span>
              </GoBackContainer>
            }

            <StyledTransitionGroup>
              {signIn}
              {signUp}
              {passwordReset}
            </StyledTransitionGroup>
          </RightInner>
          </Right>
        </Container>
    );
  }
}

export default injectIntl<Props>(SignInUp);
