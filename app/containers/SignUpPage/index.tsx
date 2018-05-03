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

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

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
    min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
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
  display: none;

  ${media.biggerThanMaxTablet`
    display: block;
  `}
`;

const Right = Section.extend`
  width: 100%;
  display: flex;
  align-items: stretch;

  ${media.biggerThanMaxTablet`
    padding-left: 50vw;
  `}
`;

const RightInner = styled.div`
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 30px;
  padding-right: 30px;
`;

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface ITracks {
  successfulSignUp: () => void;
}

interface Props extends InputProps, DataProps {}

interface State {}

class SignUpPage extends React.PureComponent<Props & ITracks & WithRouterProps, State> {
  subscriptions: Subscription[];

  constructor(props: Props & ITracks & WithRouterProps) {
    super(props);
    this.state = {};
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent('signUpFlowGoToSecondStep').subscribe(() => {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSignUpCompleted = () => {
    browserHistory.push('/');
    // track signup for analytics
    this.props.successfulSignUp();
  }

  render() {
    const { authUser, location } = this.props;
    const isInvitation = (location.pathname === '/invite');
    const token: string | null = get(location.query, 'token', null);

    if (authUser && authUser.attributes.registration_completed_at) {
      this.onSignUpCompleted();
    }

    return (
      <Container>
        <Left>
          <SignInUpBanner />
        </Left>
        <Right>
          <RightInner>
            <SignUp
              isInvitation={isInvitation}
              token={token}
              onSignUpCompleted={this.onSignUpCompleted}
            />
          </RightInner>
        </Right>
      </Container>
    );
  }
}

// Add router props and analytics (tracking) to the SignUpPage
const SignUpPageWithHOCs = withRouter(injectTracks<Props>(tracks)(SignUpPage));

export default (inputProps: InputProps) => (
  <GetAuthUser>
    {authUser => <SignUpPageWithHOCs {...inputProps} authUser={authUser} />}
  </GetAuthUser>
);
