import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { browserHistory, Link } from 'react-router';

// components
import NotificationMenu from './components/NotificationMenu';
import UserMenu from './components/UserMenu';
import MobileNavigation from './components/MobileNavigation';
import Icon from 'components/UI/Icon';

// services
import { authUserStream, signOut } from 'services/auth';
import { currentTenantStream, ITenant } from 'services/tenant';
import { IUser } from 'services/users';

// utils
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { media } from 'utils/styleUtils';
import { FormattedMessage, injectIntl } from 'react-intl';

// style
import { lighten, darken } from 'polished';
import messages from './messages';
import styled, { ThemeProvider, css } from 'styled-components';

const Container: any = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  height: ${(props) => props.theme.menuHeight}px;
  position: relative;
  background: #fff;
  /* background: rgba(255, 255, 255, 0.95); */
  border-bottom: 1px solid #fff;
  /* box-shadow: 0 2px 2px -2px rgba(0, 0, 0, 0.15); */
  z-index: 999;
  position: fixed;
  top: 0;
  transition: border-color 200ms ease-out, box-shadow 200ms ease-out;

  ${(props: any) => props.scrolled && css`
    border-color: ${props => props.theme.colorNavBottomBorder};
    /* box-shadow: 0 2px 2px -2px rgba(0, 0, 0, 0.15); */
  `}
`;

const Left = styled.div`
  display: flex;
  z-index: 2;
`;

const LogoLink = styled(Link)`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Logo = styled.div`
  cursor: pointer;
  height: 42px;
  padding: 0px 15px;
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

const NavigationItem = styled(Link)`
  height: 100%;
  opacity: 0.4;
  transition: opacity 150ms ease;
  color: ${props => props.theme.colorNavFg} !important;
  font-size: 17px;
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
  padding: 0;

  ${(props: any) => props.hideOnPhone && media.phone`display: none;`}
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 18px;
  padding-right: 18px;
  border-radius: 5px;
  border-radius: 999em;
  background: ${(props) => props.theme.colorMain};
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: ${props => darken(0.15, props.theme.colorMain)};
  }

  ${media.phone`
    padding: 10px;
  `}
`;

const ButtonIcon = styled(Icon)`
  fill: #fff;
  margin-right: 18px;

  ${media.phone`
    margin-right: 8px;
  `}
`;

const ButtonText = styled.span`
  color: #fff;
  font-weight: 400;
  font-size: 16px;
  line-height: 16px;
  white-space: nowrap;
`;

const LoginLink = styled.div`
  color: ${(props) => props.theme.colorMain};
  font-size: 16px;
  font-weight: 400;
  padding-left: 32px;
  padding-right: 32px;

  &:hover {
    color: ${(props) => darken(0.2, props.theme.colorMain)};
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

class Navbar extends React.PureComponent<Props & ITracks, State> {
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
    window.addEventListener('scroll', this.onPageScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onPageScroll);
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onPageScroll = (event: UIEvent) => {
    if (!this.state.scrolled && document.documentElement.scrollTop > 0) {
      this.setState({ scrolled: true });
    }

    if (this.state.scrolled && document.documentElement.scrollTop === 0) {
      this.setState({ scrolled: false });
    }
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

    this.setState({
      notificationPanelOpened: !this.state.notificationPanelOpened,
    });
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
    const { authUser, currentTenant, scrolled } = this.state;
    const tenantLogo = (currentTenant ? currentTenant.data.attributes.logo.medium : null);

    return (
      <ThemeProvider theme={this.navbarTheme}>
        <Container scrolled={scrolled}>
          <MobileNavigation />
          <Left>
            {tenantLogo &&
              <LogoLink to="/">
                <Logo height="100%">
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
              <Button onClick={this.goToAddIdeaPage}>
                <ButtonIcon name="add_circle" />
                <ButtonText>
                  <FormattedMessage {...messages.startIdea} />
                </ButtonText>
              </Button>
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
                <Link to="/sign-in">
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

export default injectTracks<Props>({
  trackClickOpenNotifications: tracks.clickOpenNotifications,
  trackClickCloseNotifications: tracks.clickCloseNotifications,
})(Navbar);
