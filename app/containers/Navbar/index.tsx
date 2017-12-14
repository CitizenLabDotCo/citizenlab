import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { withRouter, RouterState, browserHistory, Link } from 'react-router';

// components
import NotificationMenu from './components/NotificationMenu';
import UserMenu from './components/UserMenu';
import MobileNavigation from './components/MobileNavigation';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

// services
import { authUserStream, signOut } from 'services/auth';
import { currentTenantStream, ITenant } from 'services/tenant';
import { IUser } from 'services/users';

// utils
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { media } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import { darken } from 'polished';
import styled, { ThemeProvider, css, keyframes } from 'styled-components';

// typings
import { IModalInfo } from 'containers/App';

const Container: any = styled.div`
  width: 100%;
  height: ${(props) => props.theme.menuHeight}px;
  display: flex;
  justify-content: space-between;
  z-index: 999;
  position: fixed;
  top: 0;
  background: #fff;
  box-shadow: ${(props: any) => props.alwaysShowBorder ? '0px 1px 3px rgba(0, 0, 0, 0.13)' : '0px 1px 3px rgba(0, 0, 0, 0)'};
  transition: all 150ms ease-out;

  ${(props: any) => props.scrolled && css`
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.13);
  `}

  * {
    user-select: none;
    outline: none;
  }

  ${media.smallerThanMaxTablet`
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
    position: relative;
  `}
`;

const Left = styled.div`
  display: flex;
  z-index: 2;
`;

const LogoLink = styled(Link) `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  height: 42px;
  margin: 0;
  padding: 0px;
  padding-right: 15px;
  padding-left: 30px;
  cursor: pointer;
`;

const NavigationItems = styled.div`
  height: 100%;
  display: flex;
  margin-left: 35px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const NavigationItem = styled(Link) `
  height: 100%;
  color: #999;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
  outline: none;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -webkit-tap-highlight-color: transparent;

  &:not(:last-child) {
    padding-right: 40px;
  }

  &.active,
  &:hover {
    color: #000;
  }
`;

const Right = styled.div`
  display: flex;
  z-index: 2;
  align-items: center;
  padding-right: 30px;
`;

const RightItem: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-left: 18px;
  padding-right: 18px;
  outline: none;

  &:last-child {
    padding-right: 0px;
  }

  &.notification {
    padding-left: 10px;
  }

  * {
    outline: none;
  }

  &.addIdea {
    ${media.smallerThanMinTablet`
        display: none;
    `}

    ${(props: any) => props.loggedIn && css`
      ${media.smallerThanMinTablet`
        display: flex;
      `}
    `}
  }

  ${media.phone`
    &.addIdea {
      padding: 0px;
    }
  `}

  ${(props: any) => props.hideOnPhone && media.phone`
    display: none;
  `}
`;

const LoginLink = styled.div`
  color: ${(props) => props.theme.colorMain};
  font-size: 16px;
  font-weight: 400;
  padding: 0;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
  }
`;

type Props = {};

type Tracks = {
  trackClickOpenNotifications: () => void;
  trackClickCloseNotifications: () => void;
};

type State = {
  authUser: IUser | null;
  currentTenant: ITenant | null;
  currentTenantLogo: string | null;
  notificationPanelOpened: boolean;
  scrolled: boolean;
};

export const namespace = 'containers/Navbar/index';

class Navbar extends React.PureComponent<Props & Tracks & RouterState, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      authUser: null,
      currentTenant: null,
      currentTenantLogo: null,
      notificationPanelOpened: false,
      scrolled: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const authUser$ = authUserStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        authUser$,
        currentTenant$
      ).subscribe(([authUser, currentTenant]) => {
        this.setState({
          authUser,
          currentTenant,
          currentTenantLogo: (currentTenant ? currentTenant.data.attributes.logo.medium + '?' + Date.now() : null)
        });
      })
    ];
  }

  componentDidMount() {
    this.subscriptions.push(
      Rx.Observable.fromEvent(window, 'scroll', { passive: true }).sampleTime(20).subscribe((bleh) => {
        this.setState((state) => {
          const scrolled = (window.scrollY > 0);
          return (state.scrolled !== scrolled ? { scrolled } : state);
        });
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  toggleNotificationPanel = () => {
    if (this.state.notificationPanelOpened) {
      this.props.trackClickCloseNotifications();
    } else {
      this.props.trackClickOpenNotifications();
    }

    this.setState(state => ({ notificationPanelOpened: !state.notificationPanelOpened }));
  }

  closeNotificationPanel = () => {
    // There seem to be some false closing triggers on initializing,
    // so we check whether it's actually open
    if (this.state.notificationPanelOpened) {
      this.props.trackClickCloseNotifications();
    }

    this.setState({ notificationPanelOpened: false });
  }

  render() {
    const { pathname } = this.props.location;
    const { authUser, currentTenant, currentTenantLogo, scrolled } = this.state;
    const alwaysShowBorder = [
      'ideas/',
      'admin',
      'profile',
      'complete-signup',
      'sign-in',
      'sign-up',
      'password-recovery',
      'reset-password',
      'authentication-error'
    ].some((urlSegment) => {
      return pathname.startsWith('/' + urlSegment);
    });

    return (
      <div>
        <MobileNavigation />
        <Container scrolled={scrolled} alwaysShowBorder={alwaysShowBorder}>
          <Left>
            {currentTenantLogo &&
              <LogoLink to="/">
                <Logo src={currentTenantLogo} alt="logo" />
              </LogoLink>
            }

            <NavigationItems>
              <NavigationItem to="/" activeClassName="active">
                <FormattedMessage {...messages.pageOverview} />
              </NavigationItem>
              <NavigationItem to="/ideas" activeClassName="active">
                <FormattedMessage {...messages.pageIdeas} />
              </NavigationItem>
              <NavigationItem to="/projects" activeClassName="active">
                <FormattedMessage {...messages.pageProjects} />
              </NavigationItem>
              <NavigationItem to="/pages/information" activeClassName="active">
                <FormattedMessage {...messages.pageInformation} />
              </NavigationItem>
            </NavigationItems>
          </Left>

          <Right>
            <RightItem className="addIdea" loggedIn={authUser !== null}>
              <Button
                className="e2e-add-idea-button"
                text={<FormattedMessage {...messages.startIdea} />}
                style="primary"
                size="1"
                icon="plus-circle"
                linkTo="/ideas/new"
                circularCorners={true}
              />
            </RightItem>

            {authUser &&
              <RightItem hideOnPhone={true} className="notification">
                <NotificationMenu />
              </RightItem>
            }

            {authUser &&
              <RightItem hideOnPhone={true}>
                <UserMenu />
              </RightItem>
            }

            {!authUser &&
              <RightItem hideOnPhone={false}>
                <Link to="/sign-in" id="e2e-login-link">
                  <LoginLink>
                    <FormattedMessage {...messages.login} />
                  </LoginLink>
                </Link>
              </RightItem>
            }
          </Right>
        </Container>
      </div>
    );
  }
}

export default withRouter(injectTracks<Props>({
  trackClickOpenNotifications: tracks.clickOpenNotifications,
  trackClickCloseNotifications: tracks.clickCloseNotifications,
})(Navbar));
