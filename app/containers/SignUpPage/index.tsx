import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { get } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import SignUp from 'components/SignUp';
import SignInUpBanner from 'components/SignInUpBanner';

// utils
import eventEmitter from 'utils/eventEmitter';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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

interface Props {}

interface ITracks {
  successfulSignUp: () => void;
}

interface State {}

class SignUpPage extends PureComponent<Props & ITracks & WithRouterProps, State> {
  subscriptions: Subscription[];

  constructor(props: Props & ITracks & WithRouterProps) {
    super(props);
    this.state = {};
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent('signUpFlowGoToSecondStep').subscribe(() => {
        window.scrollTo(0, 0);
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSignUpCompleted = () => {
    clHistory.push('/');
    // track signup for analytics
    this.props.successfulSignUp();
  }

  render() {
    const { location } = this.props;
    const isInvitation = location.pathname.replace(/\/$/, '').endsWith('invite');
    const token: string | null = get(location.query, 'token', null);
    const title = (isInvitation ? <FormattedMessage {...messages.invitationTitle} /> : undefined);

    return (
      <Container>
        <Left>
          <SignInUpBanner />
        </Left>
        <Right>
          <RightInner>
            <SignUp
              step1Title={title}
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
export default withRouter(injectTracks<Props>(tracks)(SignUpPage));
