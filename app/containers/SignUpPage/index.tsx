import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// router
import { browserHistory } from 'react-router';

// components
import SignUp from 'components/SignUp';
import SignInUpBanner from 'components/SignInUpBanner';
import Spinner from 'components/UI/Spinner';

// services
import { authUserStream } from 'services/auth';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Loading = styled.div`
  width: 100%;
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #f9f9fa;
  position: relative;

  ${media.biggerThanMaxTablet`
    overflow: hidden;
    height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  `}

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  align-items: stretch;
`;

const Left = Section.extend`
  width: 50vw;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  display: none;

  ${media.biggerThanMaxTablet`
    display: block;
  `}
`;

const Right = Section.extend`
  position: relative;

  ${media.biggerThanMaxTablet`
    overflow: hidden;
    overflow-y: auto;
  `}
`;

const RightInner = styled.div`
  width: 100%;

  ${media.biggerThanMaxTablet`
    width: calc(50vw - 20px);
    position: absolute;
    top: 0;
    left: 50vw;
    overflow: hidden;
    padding-left: 20px;
  `}
`;

const RightInnerInner = styled.div`
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 30px;
  padding-right: 30px;
`;

type Props = {
  params?: {
    token: string;
  } | undefined;
};

type State = {
  loaded: boolean;
};

export default class SignUpPage extends React.PureComponent<Props, State> {
  scrollDivElement: HTMLDivElement | null;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      loaded: false
    };
    this.scrollDivElement = null;
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.first().subscribe((authUser) => {
        if (authUser) {
          browserHistory.push('/');
        } else {
          this.setState({ loaded: true });
        }
      }),

      eventEmitter.observeEvent('signUpFlowGoToSecondStep').subscribe(() => {
        if (this.scrollDivElement) {
          this.scrollDivElement.scrollTop = 0;
        }
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSignUpCompleted = () => {
    browserHistory.push('/');
  }

  setRef = (element: HTMLDivElement) => {
    if (element) {
      this.scrollDivElement = element;
    }
  }

  render() {
    const { loaded } = this.state;

    if (!loaded) {
      return (
        <Loading>
          <Spinner size="32px" color="#666" />
        </Loading>
      );
    }

    if (loaded) {
      return (
        <Container>
          <Left>
            <SignInUpBanner />
          </Left>
          <Right innerRef={this.setRef}>
            <RightInner>
              <RightInnerInner>
                <SignUp onSignUpCompleted={this.onSignUpCompleted} />
              </RightInnerInner>
            </RightInner>
          </Right>
        </Container>
      );
    }

    return null;
  }
}
