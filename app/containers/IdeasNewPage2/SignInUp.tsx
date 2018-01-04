import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// components
import Icon from 'components/UI/Icon';
import SignIn from 'components/SignIn';
import SignUp from 'components/SignUp';
import SignInUpBanner from 'components/SignInUpBanner';

// services
import { currentTenantStream, ITenant } from 'services/tenant';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
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
  position: relative;
  overflow: hidden;

  ${media.smallerThanMaxTablet`
    overflow: auto;
    height: auto;
  `}
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

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const Right = Section.extend`
  width: 100%;
  padding-left: 50vw;
  overflow: hidden;
  overflow-y: auto;

  ${media.smallerThanMaxTablet`
    padding: 0;
    overflow: auto;
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

  ${media.smallerThanMaxTablet`
    padding-bottom: 130px;
  `}
`;

const FormContainer = styled.div``;

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
  onSignInUpCompleted: (userId: string) => void;
};

type State = {
  show: 'signIn' | 'signUp';
  currentTenant: ITenant | null;
};

class SignInUp extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      show: 'signIn',
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
    this.setState({ show: 'signUp' });
  }

  goToSignInForm = () => {
    this.setState({ show: 'signIn' });
  }

  handleOnSignedIn = (userId: string) => {
    this.props.onSignInUpCompleted(userId);
  }

  handleOnSignUpCompleted = (userId: string) => {
    this.props.onSignInUpCompleted(userId);
  }

  render() {
    const { show } = this.state;
    const { onGoBack } = this.props;

    const signIn = (show === 'signIn' ? (
      <FormContainer>
        <Form>
          <Title>
            <FormattedMessage {...messages.signInTitle} />
          </Title>
          <SignIn
            onSignedIn={this.handleOnSignedIn}
            goToSignUpForm={this.goToSignUpForm}
          />
        </Form>
      </FormContainer>
    ) : null);

    const signUp = (show === 'signUp' ? (
      <FormContainer>
        <Form>
          <Title>
            <FormattedMessage {...messages.signUpTitle} />
          </Title>
          <SignUp onSignUpCompleted={this.handleOnSignUpCompleted} />
        </Form>
      </FormContainer>
    ) : null);

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
            {signIn}
            {signUp}
          </RightInner>
        </Right>
      </Container>
    );
  }
}

export default SignInUp;
