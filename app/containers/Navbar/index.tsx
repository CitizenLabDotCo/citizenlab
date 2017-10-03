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
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import { darken } from 'polished';
import styled, { ThemeProvider, css, keyframes } from 'styled-components';

const Container: any = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  height: ${(props) => props.theme.menuHeight}px;
  position: relative;
  background: #fff;
  z-index: 999;
  position: fixed;
  top: 0;
  transition: all 150ms ease-out;
  /* border-bottom: 1px solid; */
  /* border-color: ${(props: any) => props.hideBorder ? '#fff' : props.theme.colorNavBottomBorder}; */

  ${(props: any) => props.scrolled && css`
    /* border-color: ${props => props.theme.colorNavBottomBorder}; */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `}
`;

const Left = styled.div`
  display: flex;
  z-index: 2;
`;

const LogoLink = styled(Link) `
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Logo = styled.div`
  cursor: pointer;
  height: 42px;
  padding: 0px;
  padding-right: 15px;
  padding-left: 25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  img {
    height: 100%;
  }
`;

const NavigationItems = styled.div`
  height: 100%;
  display: flex;
  margin-left: 35px;

  ${media.phone`
    display: none;
  `}
`;

const NavigationItem = styled(Link) `
  height: 100%;
  opacity: 0.4;
  transition: opacity 150ms ease;
  color: ${props => props.theme.colorNavFg} !important;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;

  &:not(:last-child) {
    padding-right: 40px;
  }

  &.active,
  &:hover {
    opacity: 1;
  }
`;

const Right = styled.div`
  display: flex;
  z-index: 2;
  align-items: center;
`;

const RightItem: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-left: 18px;
  padding-right: 18px;
  outline: none;

  * {
    outline: none;
  }

  ${(props: any) => props.hideOnPhone && media.phone`display: none;`}
`;

const AddIdeaButton = styled(Button)``;

const LoginLink = styled.div`
  color: ${(props) => props.theme.colorMain};
  font-size: 16px;
  font-weight: 400;
  padding-left: 0px;
  padding-right: 30px;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
  }
`;

interface ITracks {
  trackClickOpenNotifications: () => void;
  trackClickCloseNotifications: () => void;
}

type Props = {};

type State = {
  authUser: IUser | null;
  currentTenant: ITenant | null;
  notificationPanelOpened: boolean;
  scrolled: boolean;
};

class Navbar extends React.PureComponent<Props & ITracks & InjectedIntlProps & RouterState, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      authUser: null,
      currentTenant: null,
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
        this.setState({ authUser, currentTenant });
      })
    ];
  }

  componentDidMount() {
    this.subscriptions.push(
      Rx.Observable.fromEvent(window, 'scroll').sampleTime(10).subscribe(() => {
        this.setState((state) => {
          const scrolled = (document.documentElement.scrollTop > 0);
          return (state.scrolled !== scrolled ? { scrolled } : state);
        });
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToAddIdeaPage = () => {
    browserHistory.push('/ideas/new');
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

  navbarTheme = (style) => {
    return {
      ...style,
      colorNavBg: style.menuStyle === 'light' ? '#fff' : '#222',
      colorNavBottomBorder: style.menuStyle === 'light' ? '#ddd' : '#000',
      colorNavSubtle: style.menuStyle === 'light' ? '#eaeaea' : '#444',
      colorNavFg: style.menuStyle === 'light' ? '#000' : '#fff',
    };
  }

  render() {
    const { pathname } = this.props.location;
    const { formatMessage } = this.props.intl;
    const { authUser, currentTenant, scrolled } = this.state;
    const tenantLogo = (currentTenant ? currentTenant.data.attributes.logo.medium : null);
    const hideBorder = (pathname === '/' || pathname === 'ideas' || pathname === 'projects' || pathname === '/projects');

    return (
      <ThemeProvider theme={this.navbarTheme}>
        <Container scrolled={scrolled} hideBorder={hideBorder}>
          <MobileNavigation />
          <Left>
            {tenantLogo &&
              <LogoLink to="/">
                <Logo>
                  <img src={tenantLogo} alt="logo" />
                </Logo>
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
            </NavigationItems>
          </Left>
          <Right>
            <RightItem>
              <AddIdeaButton
                className="e2e-add-idea-button"
                text={formatMessage(messages.startIdea)}
                style="primary"
                size="1"
                padding="10px 16px"
                icon="plus-circle"
                onClick={this.goToAddIdeaPage}
                circularCorners={true}
              />
            </RightItem>

            {authUser &&
              <RightItem hideOnPhone={true}>
                <NotificationMenu />
              </RightItem>
            }

            {authUser &&
              <RightItem hideOnPhone={true}>
                <UserMenu />
              </RightItem>
            }

            {!authUser &&
              <RightItem hideOnPhone={true}>
                <Link to="/sign-in" id="e2e-login-link">
                  <LoginLink>
                    <FormattedMessage {...messages.login} />
                  </LoginLink>
                </Link>
              </RightItem>
            }
          </Right>
        </Container>
      </ThemeProvider>
    );
  }
}

export default withRouter(injectTracks<Props>({
  trackClickOpenNotifications: tracks.clickOpenNotifications,
  trackClickCloseNotifications: tracks.clickCloseNotifications,
})(injectIntl<Props>(Navbar)));
