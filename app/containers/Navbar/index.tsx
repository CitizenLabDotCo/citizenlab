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
import { state, IStateStream } from 'services/state';
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

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  height: ${(props) => props.theme.menuHeight}px;
  position: relative;
  background: ${(props) => props.theme.colorNavBg};
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid ${(props) => props.theme.colorNavBottomBorder};
  z-index: 999;
  position: fixed;
  top: 0;

  background: none;
  border: none;
`;

const Left = styled.div`
  display: flex;
  z-index: 2;
`;

const subtleSeparator = css`
  border-right: 1px solid ${(props) => props.theme.colorNavSubtle};
  border: none;
`;

const Logo = styled.div`
  cursor: pointer;
  height: 100%;
  padding: 0px 20px;
  ${subtleSeparator}
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  color: ${(props) => props.theme.colorNavFg} !important;
  font-size: 19px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:not(:last-child) {
    padding-right: 50px;
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
  padding: 0 25px;

  &:not(:last-child) {
    ${subtleSeparator}
  }

  ${(props: any) => props.hideOnPhone && media.phone`display: none;`}
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 5px;
  background: ${(props) => props.theme.colorMain};
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: ${(props) => darken(0.1, props.theme.colorMain)};
  }

  ${media.phone`
    padding: 10px;
  `}
`;

const ButtonIcon = styled(Icon)`
  fill: #fff;
  margin-right: 20px;
  ${media.phone`
    margin-right: 8px;
  `}
`;

const ButtonText = styled.span`
  color: #fff;
  font-weight: 500;
  font-size: 18px;
  white-space: nowrap;
`;

const LoginLink = styled.div`
  font-size: 18px;
  color: ${(props) => props.theme.colorMain};
  font-weight: 600;

  &:hover {
    color: ${(props) => lighten(0.1, props.theme.colorMain)};
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
};

const namespace = 'NavBar/index';

class Navbar extends React.PureComponent<Props & ITracks, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    const initialState: State = { authUser: null, currentTenant: null, notificationPanelOpened: false };
    this.state$ = state.createStream<State>(namespace, namespace, initialState);
  }

  componentWillMount() {
    const authUser$ = authUserStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      Rx.Observable.combineLatest(
        authUser$, 
        currentTenant$
      ).subscribe(([authUser, currentTenant]) => {
        this.state$.next({ authUser, currentTenant });
      })
    ];
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

    this.state$.next({
      notificationPanelOpened: !this.state.notificationPanelOpened,
    });
  }

  closeNotificationPanel = () => {
    // There seem to be some false closing triggers on initializing,
    // so we check whether it's actually open
    if (this.state.notificationPanelOpened) {
      this.props.trackClickCloseNotifications();
    }

    this.state$.next({ notificationPanelOpened: false });
  }

  navbarTheme = (style) => {
    return {
      ...style,
      colorNavBg: style.menuStyle === 'light' ? '#FFFFFF' : '#222222',
      colorNavBottomBorder: style.menuStyle === 'light' ? '#EAEAEA' : '#000000',
      colorNavSubtle: style.menuStyle === 'light' ? '#EAEAEA' : '#444444',
      colorNavFg: style.menuStyle === 'light' ? '#000000' : '#FFFFFF',
    };
  }

  render() {
    const { authUser, currentTenant } = this.state;
    const tenantLogo = (currentTenant ? currentTenant.data.attributes.logo.small : null);

    return (
      <ThemeProvider theme={this.navbarTheme}>
        <Container>
          <MobileNavigation />
          <Left>
            {tenantLogo &&
              <Link to="/">
                <Logo height="100%">
                  <img src={tenantLogo} alt="logo" />
                </Logo>
              </Link>
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
                  <FormattedMessage {...messages.addIdea} />
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
