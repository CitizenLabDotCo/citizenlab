import React from 'react';
import { get } from 'lodash';
import { Subscription } from 'rxjs/Rx';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';

// components
import SignUp from 'components/SignUp';
import SignInUpBanner from 'components/SignInUpBanner';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

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
    -webkit-overflow-scrolling: touch;
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

interface InputProps extends WithRouterProps{}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class SignUpPage extends React.PureComponent<Props, State> {
  scrollDivElement: HTMLDivElement | null;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {};
    this.scrollDivElement = null;
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent('signUpFlowGoToSecondStep').subscribe(() => {
        if (this.scrollDivElement) {
          this.scrollDivElement.scrollTop = 0;
        }
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSignUpCompleted = () => {
    browserHistory.push('/');
  }

  setRef = (element: HTMLDivElement) => {
    this.scrollDivElement = element;
  }

  render() {
    const { authUser, location } = this.props;
    const isInvitation = (location.pathname === '/invite');
    const token: string | null = get(location.query, 'token', null);

    if (authUser) {
      browserHistory.push('/');
    }

    return (
      <Container>
        <Left>
          <SignInUpBanner />
        </Left>
        <Right innerRef={this.setRef}>
          <RightInner>
            <RightInnerInner>
              <SignUp isInvitation={isInvitation} token={token} onSignUpCompleted={this.onSignUpCompleted} />
            </RightInnerInner>
          </RightInner>
        </Right>
      </Container>
    );
  }
}

export default withRouter((inputProps: InputProps) => (
  <GetAuthUser>
    {authUser => <SignUpPage {...inputProps} authUser={authUser} />}
  </GetAuthUser>
));
