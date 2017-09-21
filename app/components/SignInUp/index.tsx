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
  background: #f2f2f2;
`;

const PageContainer = styled.div`
  width: 100%;
  max-width: 980px;
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
	width: 460px;
	height: 540px;
	border-radius: 6px;
  background-color: #fff;
  margin-right: 120px;
  padding: 50px;
  position: relative;
  ${media.phone`
    display: none;
  `}
`;

const LogoContainer = styled.div`
  height: 60px;
`;

const Logo = styled.img`
  width: auto;
  height: 100%;
`;

const Slogan1 = styled.div`
  color: ${props => props.theme.colorMain || '#333'};
  font-size: 31px;
  line-height: 36px;
  font-weight: 500;
  margin-top: 75px;
`;

const Slogan2 = styled.div`
  color: #f2f2f2;
  font-size: 130px;
  line-height: 105px;
  font-weight: 800;
  position: absolute;
  bottom: 25px;
  left: 20px;
  right: 20px;
`;

const Forms = styled.div`
  flex: 1;
`;

const StyledTransitionGroup = styled(TransitionGroup) `
  position: relative;
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

const GoBackContainer = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: -3px;margin-bottom: 30px;
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

const Separator = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  position: relative;
  margin-top: 15px;
  margin-bottom: 5px;
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
  width: 50px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f2f2;

  span {
    color: #aaa;
    font-size: 15px;
  }
`;

const FooterButton = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 15px;
  padding-bottom: 15px;
`;

type Props = {
  onGoBack?: () => void;
  onSignInUpCompleted: () => void;
  show?: 'signIn' | 'signUp' | 'passwordReset';
  signInTitleMessage?: { id: string, defaultMessage: string };
  signUpTitleMessage?: { id: string, defaultMessage: string };
};

type State = {
  show: 'signIn' | 'signUp' | 'passwordReset';
  currentTenant: ITenant | null;
};

class SignInUp extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  currentTenant$: IStream<ITenant>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      show: props.show || 'signIn',
      currentTenant: null
    };
    this.currentTenant$ = currentTenantStream();
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
    const { onGoBack, signInTitleMessage, signUpTitleMessage } = this.props;
    const timeout = 500;

    const signIn = (show === 'signIn' && (
      <CSSTransition classNames="page" timeout={timeout}>
        <FormContainer>
          <Form>
            <Title>{formatMessage(signInTitleMessage || messages.signInTitle)}</Title>

            <SignIn onSignedIn={this.handleOnSignedIn} onForgotPassword={this.goToPasswordResetForm} />

            <Separator>
              <SeparatorLine />
              <SeparatorTextContainer>
                <SeparatorText>
                  <span><FormattedMessage {...messages.or} /></span>
                </SeparatorText>
              </SeparatorTextContainer>
            </Separator>

            <FooterButton>
              <Button
                size="2"
                style="secondary"
                text={formatMessage(messages.createAnAccount)}
                fullWidth={true}
                onClick={this.goToSignUpForm}
              />
            </FooterButton>
          </Form>
        </FormContainer>
      </CSSTransition>
    ));

    const signUp = (show === 'signUp' && (
      <CSSTransition classNames="form" timeout={timeout}>
        <FormContainer>
          <Form>
            <Title>{formatMessage(signUpTitleMessage || messages.signUpTitle)}</Title>
            <SignUp onSignedUp={this.handleOnSignedUp} />
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
        <PageContainer>
          <Banner>
            <LogoContainer>
              <Logo src={logo as string} />
              <Slogan1><FormattedMessage {...messages.slogan1} /></Slogan1>
              <Slogan2><FormattedMessage {...messages.slogan2} /></Slogan2>
            </LogoContainer>
          </Banner>
          <Forms>
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
          </Forms>
        </PageContainer>
      </Container>
    );
  }
}

export default injectIntl<Props>(SignInUp);
