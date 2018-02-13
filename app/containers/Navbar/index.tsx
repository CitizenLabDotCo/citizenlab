import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// libraries
import { withRouter, RouterState, Link } from 'react-router';

// components
import NotificationMenu from './components/NotificationMenu';
import UserMenu from './components/UserMenu';
import MobileNavigation from './components/MobileNavigation';
import IdeaButton from './components/IdeaButton';

// services
import { authUserStream } from 'services/auth';
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
import styled, { css, } from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: ${(props) => props.theme.menuHeight}px;
  display: flex;
  justify-content: space-between;
  z-index: 999;
  position: fixed;
  top: 0;
  background: #fff;

  * {
    user-select: none;
    outline: none;
  }

  &.hideBorder::after {
    opacity: 0;
  }

  &.scrolled::after,
  &.hideBorder.scrolled::after {
    opacity: 1;
  }

  &::after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.12);
    transition: opacity 100ms ease-out;
  }

  ${media.smallerThanMaxTablet`
    position: relative;
    top: auto;

    &::after {
      opacity: 1;
    }
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
  max-height: 42px;
  margin: 0;
  padding: 0px;
  padding-right: 15px;
  padding-left: 30px;
  cursor: pointer;

  ${media.smallerThanMinTablet`
    max-width: 180px;
  `}
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
  font-size: 17px;
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

class Navbar extends React.PureComponent<Props & Tracks & RouterState, State> {
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

  componentDidMount() {
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
      }),

      Rx.Observable.fromEvent(window, 'scroll', { passive: true }).sampleTime(20).subscribe(() => {
        const scrolled = (window.scrollY > 0);
        this.setState({ scrolled });
      })
    ];
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
    const { authUser, currentTenantLogo, scrolled } = this.state;
    const hideBorder = [
      'pages',
      'projects',
      'ideas'
    ].some((urlSegment) => {
      return pathname.startsWith('/' + urlSegment);
    });

    return (
      <>
        <MobileNavigation />
        <Container className={`${scrolled && 'scrolled'} ${hideBorder && 'hideBorder'}`}>
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
              <NavigationItem to="/projects" activeClassName="active">
                <FormattedMessage {...messages.pageProjects} />
              </NavigationItem>
              <NavigationItem to="/ideas" activeClassName="active">
                <FormattedMessage {...messages.pageIdeas} />
              </NavigationItem>
              <NavigationItem to="/pages/information" activeClassName="active">
                <FormattedMessage {...messages.pageInformation} />
              </NavigationItem>
            </NavigationItems>
          </Left>

          <Right>
            <RightItem className="addIdea" loggedIn={authUser !== null}>
              <IdeaButton />
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
      </>
    );
  }
}

export default withRouter(injectTracks<Props>({
  trackClickOpenNotifications: tracks.clickOpenNotifications,
  trackClickCloseNotifications: tracks.clickCloseNotifications,
})(Navbar));
