import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { get } from 'lodash';

// libraries
import { browserHistory, withRouter, RouterState, Link } from 'react-router';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';

// components
import NotificationMenu from './components/NotificationMenu';
import UserMenu from './components/UserMenu';
import MobileNavigation from './components/MobileNavigation';
import IdeaButton from './components/IdeaButton';
import Icon from 'components/UI/Icon';

// services
import { localeStream } from 'services/locale';
import { authUserStream } from 'services/auth';
import { currentTenantStream, ITenant } from 'services/tenant';
import { IUser } from 'services/users';
import { projectsStream, IProjects } from 'services/projects';

// utils
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { media } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// style
import { darken } from 'polished';
import styled, { css, } from 'styled-components';

// typings
import { Locale } from 'typings';

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
  align-items: center;
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

  &:not(:last-child) {
    margin-right: 40px;
  }

  &.active,
  &:hover {
    color: #000;
  }
`;

const NavigationDropdown = styled.div`
  position: relative;
  margin-right: 40px;
`;

const NavigationDropdownItemText = styled.div`
  color: #999;
  font-size: 17px;
  font-weight: 400;
  transition: all 100ms ease-out;
`;

const NavigationDropdownItemIcon = styled(Icon)`
  height: 7px;
  fill: #999;
  margin-left: 5px;
  margin-top: 4px;
  transition: all 100ms ease-out;
`;

const NavigationDropdownItem = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    ${NavigationDropdownItemText} {
      color: #000;
    }

    ${NavigationDropdownItemIcon} {
      fill: #000;
    }
  }
`;

const NavigationDropdownMenu = styled(clickOutside)`
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border: solid 1px #e0e0e0;
  position: absolute;
  top: 35px;
  left: -10px;
  z-index: 2;
  transform-origin: left top;

  * {
    user-select: none;
  }

  ::before,
  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  ::after {
    top: -20px;
    left: 20px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 19px;
    border-color: transparent transparent #e0e0e0 transparent;
    border-width: 11px;
  }

  &.dropdown-enter {
    opacity: 0;
    transform: scale(0.9);

    &.dropdown-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: all 200ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

const NavigationDropdownMenuInner = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const NavigationDropdownList = styled.div`
  max-height: 275px;
  width: 280px;
  display: flex;
  flex-direction: column;
  margin: 10px;
  margin-right: 5px;
  overflow-y: auto;
`;

const NavigationDropdownListItem = styled(Link)`
  color: ${(props) => props.theme.colors.label};
  font-size: 17px;
  font-weight: 400;
  text-decoration: none;
  padding: 10px;
  margin-right: 5px;
  background: #fff;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    color: #000;
    text-decoration: none;
    background: #f6f6f6;
  }
`;

const NavigationDropdownFooter = styled(Link)`
  width: 100%;
  color: #333;
  font-size: 17px;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 17px 15px;
  cursor: pointer;
  background: #f0f0f0;
  transition: all 80ms ease-out;

  &:hover {
    color: #000;
    text-decoration: none;
    background: #e0e0e0;
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
  locale: Locale | null;
  authUser: IUser | null;
  currentTenant: ITenant | null;
  projects: IProjects | null;
  notificationPanelOpened: boolean;
  projectsDropdownOpened: boolean;
  scrolled: boolean;
};

class Navbar extends React.PureComponent<Props & Tracks & RouterState, State> {
  dropdownElement: HTMLElement | null;
  unlisten: Function;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      authUser: null,
      currentTenant: null,
      projects: null,
      notificationPanelOpened: false,
      projectsDropdownOpened: false,
      scrolled: false
    };
    this.dropdownElement = null;
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const authUser$ = authUserStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const projects$ = projectsStream().observable;

    this.unlisten = browserHistory.listen(() => this.setState({ projectsDropdownOpened: false }));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        authUser$,
        currentTenant$
      ).subscribe(([locale, authUser, currentTenant]) => {
        this.setState({
          locale,
          authUser,
          currentTenant
        });
      }),

      projects$.subscribe((projects) => {
        console.log(projects);
        this.setState({ projects });
      }),

      Rx.Observable.fromEvent(window, 'scroll', { passive: true }).sampleTime(20).subscribe(() => {
        const scrolled = (window.scrollY > 0);
        this.setState({ scrolled });
      })
    ];
  }

  componentWillUnmount() {
    if (this.dropdownElement) {
      this.dropdownElement.removeEventListener('wheel', this.scrolling, false);
    }

    this.unlisten();

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

  handleProjectsDropdownToggle = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState(state => ({ projectsDropdownOpened: !state.projectsDropdownOpened }));
  }

  handleProjectsDropdownOnClickOutside = (event: React.FormEvent<MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ projectsDropdownOpened: false });
  }

  setRef = (element: HTMLElement) => {
    if (element) {
      this.dropdownElement = element;

      if (this.dropdownElement) {
        this.dropdownElement.addEventListener('wheel', this.scrolling, false);
      }
    }
  }

  scrolling = (event: WheelEvent) => {
    if (this.dropdownElement) {
      const deltaY = (event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY);
      this.dropdownElement.scrollTop += deltaY;
      event.preventDefault();
    }
  }

  goToProjectsPage = () => {
    browserHistory.push('/projects');
  }

  render() {
    const { pathname } = this.props.location;
    const { locale, authUser, currentTenant, projects, scrolled, projectsDropdownOpened } = this.state;
    const hideBorder = ['pages'].some(urlSegment => pathname.startsWith('/' + urlSegment));

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const currentTenantLogo = get(currentTenant, 'data.attributes.logo.medium', null);

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

                {projects && projects.data && projects.data.length > 0 &&
                  <NavigationDropdown>
                    <NavigationDropdownItem onClick={this.handleProjectsDropdownToggle}>
                      <NavigationDropdownItemText>
                        <FormattedMessage {...messages.pageProjects} />
                      </NavigationDropdownItemText>
                      <NavigationDropdownItemIcon name="dropdown" />
                    </NavigationDropdownItem>
                    <CSSTransition
                      in={projectsDropdownOpened}
                      timeout={200}
                      mountOnEnter={true}
                      unmountOnExit={true}
                      classNames="dropdown"
                      exit={false}
                    >
                      <NavigationDropdownMenu onClickOutside={this.handleProjectsDropdownOnClickOutside}>
                        <NavigationDropdownMenuInner>
                          <NavigationDropdownList innerRef={this.setRef}>
                            {projects.data.map((project) => (
                              <NavigationDropdownListItem key={project.id} to={`/projects/${project.attributes.slug}`}>
                                {getLocalized(project.attributes.title_multiloc, locale, currentTenantLocales)}
                              </NavigationDropdownListItem>
                            ))}
                          </NavigationDropdownList>

                          <NavigationDropdownFooter to={`/projects`}>
                            <FormattedMessage {...messages.allProjects} />
                          </NavigationDropdownFooter>
                        </NavigationDropdownMenuInner>
                      </NavigationDropdownMenu>
                    </CSSTransition>
                  </NavigationDropdown>
                }

                {/*
                <NavigationItem to="/projects" activeClassName="active">
                  <FormattedMessage {...messages.pageProjects} />
                </NavigationItem>
                <NavigationItem to="/ideas" activeClassName="active">
                  <FormattedMessage {...messages.pageIdeas} />
                </NavigationItem>
                */}

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

    return null;
  }
}

export default withRouter(injectTracks<Props>({
  trackClickOpenNotifications: tracks.clickOpenNotifications,
  trackClickCloseNotifications: tracks.clickCloseNotifications,
})(Navbar));
