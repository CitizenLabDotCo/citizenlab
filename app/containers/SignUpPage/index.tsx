import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { isString, isBoolean, isObject } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

// context
import { PreviousPathnameContext } from 'context';

// components
import SignUp from 'components/SignUp';
import SignInUpBanner from 'components/SignInUpBanner';
import SignUpPageMeta from './SignUpPageMeta';

// utils
import eventEmitter from 'utils/eventEmitter';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const Container = styled.main`
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  background: ${colors.background};
  position: relative;

  ${media.biggerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.menuHeight}px);
  `}

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const Section = styled.div`
  flex: 1;
`;

const Left = styled(Section)`
  display: none;

  ${media.biggerThanMaxTablet`
    display: block;
  `}
`;

const Right = styled(Section)``;

const RightInner = styled.div`
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 20px;
  padding-right: 20px;

  ${media.smallerThanMaxTablet`
    padding-top: 35px;
  `}
`;

export type IActionType = 'upvote' | 'downvote' | 'comment' | 'post';

export type IActionContextType = 'idea' | 'initiative' | 'project' | 'phase';

export interface IAction {
  action_type: IActionType;
  action_context_type: IActionContextType;
  action_context_id: string;
  action_context_pathname: string;
  action_requires_verification: boolean;
}

export function getAction(action) {
  if (isObject(action)) {
    const { action_type, action_context_id, action_context_type, action_context_pathname, action_requires_verification } = action as any;

    if (
      action_type === ('upvote' || 'downvote' || 'comment' || 'post') &&
      action_context_type === ('idea' || 'initiative' || 'project' || 'phase') &&
      isString(action_context_id) &&
      isString(action_context_pathname) &&
      (isBoolean(action_requires_verification) || isString(action_requires_verification))
    ) {
      const validatedAction: IAction = {
        action_type,
        action_context_type,
        action_context_id,
        action_context_pathname,
        action_requires_verification: isBoolean(action_requires_verification) ? action_requires_verification : (action_requires_verification === 'true')
      };

      return validatedAction;
    }
  }

  return;
}

export const redirectActionToSignUpPage = (action: IAction) => {
  clHistory.push({
    pathname: '/sign-up',
    query: action
  });
};

interface InputProps {}

interface DataProps {
  previousPathName: string | null;
}

interface Props extends InputProps, DataProps { }

interface State {
  goBackToUrl: string;
  action: IAction | null;
}

class SignUpPage extends PureComponent<Props & WithRouterProps, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      goBackToUrl: '/',
      action: null
    };
  }

  static getDerivedStateFromProps(nextProps: Props, _prevState: State) {
    const previousPathName = (nextProps.previousPathName ? removeLocale(nextProps.previousPathName).pathname : null);
    const goBackToUrl = (previousPathName && !(previousPathName.endsWith('/sign-up') || previousPathName.endsWith('/sign-in')) ? previousPathName : '/');
    return { goBackToUrl };
  }

  componentDidMount() {
    const action = getAction(this.props.location.query);
    this.setState({ action: action || null });
    action && window.history.replaceState(null, '', window.location.pathname);

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
    trackEventByName(tracks.successfulSignUp);
    const action = getAction(this.state.action);
    const pathname = action?.action_context_pathname || this.state.goBackToUrl;
    const query = action;
    clHistory.push({ pathname, query });
  }

  render() {
    const { location } = this.props;
    const { action } = this.state;
    const isInvitation = location.pathname.replace(/\/$/, '').endsWith('invite');
    const token = isString(location.query.token) ? location.query.token : null;
    const title = (isInvitation ? <FormattedMessage {...messages.invitationTitle} /> : undefined);

    return (
      <>
        <SignUpPageMeta />
        <Container className="e2e-sign-up-page">
          <Left>
            <SignInUpBanner />
          </Left>
          <Right>
            <RightInner>
              <SignUp
                step1Title={title}
                isInvitation={isInvitation}
                token={token}
                action={action}
                onSignUpCompleted={this.onSignUpCompleted}
              />
            </RightInner>
          </Right>
        </Container>
      </>
    );
  }
}

const SignUpPageWithHoCs = withRouter(SignUpPage);

const Data = adopt<DataProps, InputProps>({
  previousPathName: ({ render }) => <PreviousPathnameContext.Consumer>{render as any}</PreviousPathnameContext.Consumer>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SignUpPageWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
