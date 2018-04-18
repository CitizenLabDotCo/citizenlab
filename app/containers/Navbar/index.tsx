// libraries
import React from 'react';
import { get } from 'lodash';
import { adopt } from 'react-adopt';
import { Link } from 'react-router';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';

// components
import NotificationMenu from './components/NotificationMenu';
import UserMenu from './components/UserMenu';
import MobileNavigation from './components/MobileNavigation';
import IdeaButton from 'components/IdeaButton';
import Icon from 'components/UI/Icon';

// resources
import GetLocation, { GetLocationChildProps } from 'utils/resourceLoaders/components/GetLocation';
import GetAuthUser, { GetAuthUserChildProps } from 'utils/resourceLoaders/components/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'utils/resourceLoaders/components/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'utils/resourceLoaders/components/GetLocale';
import GetProjects, { GetProjectsChildProps } from 'utils/resourceLoaders/components/GetProjects';

// utils
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';
import { getProjectUrl } from 'services/projects';

// i18n
import { media } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// style
import { darken, rgba } from 'polished';
import styled, { css, } from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: ${(props) => props.theme.menuHeight}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 30px;
  padding-right: 30px;
  position: fixed;
  top: 0;
  background: #fff;
  box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.12);
  z-index: 999;

  * {
    user-select: none;
    outline: none;
  }

  &.citizen {
    ${media.smallerThanMaxTablet`
      position: relative;
      top: auto;
    `}
  }

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
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
  cursor: pointer;

  ${media.smallerThanMinTablet`
    max-width: 180px;
  `}

  ${media.phone`
    max-width: 140px;
  `}

  ${media.largePhone`
    max-width: 120px;
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
  font-size: 16px;
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
  font-size: 16px;
  font-weight: 400;
  transition: all 100ms ease-out;
`;

const NavigationDropdownItemIcon = styled(Icon)`
  height: 6px;
  width: 11px;
  fill: #999;
  margin-left: 4px;
  margin-top: 3px;
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
  transform-origin: left top;
  z-index: 5;

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
  max-height: 210px;
  width: 280px;
  display: flex;
  flex-direction: column;
  margin: 10px;
  margin-right: 5px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const NavigationDropdownListItem = styled(Link)`
  color: ${(props) => props.theme.colors.label};
  font-size: 16px;
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
  color: ${(props) => props.theme.colors.label};
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 15px 15px;
  cursor: pointer;
  background: ${props => rgba(props.theme.colors.label, 0.12)};
  border-radius: 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 80ms ease-out;

  &:hover {
    color: ${(props) => darken(0.2, props.theme.colors.label)};
    background: ${props => rgba(props.theme.colors.label, 0.22)};
    text-decoration: none;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

const RightItem: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-left: 30px;
  outline: none;

  * {
    outline: none;
  }

  &.notification {
    ${media.smallerThanMinTablet`
      display: none;
    `}
  }

  &.usermenu {
    ${media.smallPhone`
      display: none;
    `}
  }

  &.addIdea {
    padding-left: 0px;

    ${(props: any) => props.loggedIn && css`
      ${media.smallerThanMinTablet`
        display: flex;
      `}
    `}
  }

  ${media.smallerThanMinTablet`
    padding-left: 15px;
  `}
`;

const StyledIdeaButton = styled(IdeaButton)`
  &:hover {
    .Button {
      border-color: ${darken(0.2, '#e0e0e0')} !important;
    }
  }

  .Button {
    border: solid 2px #e0e0e0 !important;
  }

  .buttonText {
    color: ${(props) => props.theme.colorMain};
  }
`;

const LoginLink = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 16px;
  font-weight: 400;
  padding: 0;

  &:hover {
    color: ${(props) => darken(0.2, props.theme.colors.label)};
  }
`;

interface InputProps {}

interface DataProps {
  location: GetLocationChildProps;
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
  locale: GetLocaleChildProps;
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  notificationPanelOpened: boolean;
  projectsDropdownOpened: boolean;
}

class Navbar extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      notificationPanelOpened: false,
      projectsDropdownOpened: false
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.location !== this.props.location) {
      this.setState({ projectsDropdownOpened: false });
    }
  }

  toggleNotificationPanel = () => {
    if (this.state.notificationPanelOpened) {
      trackEvent(tracks.clickCloseNotifications);
    } else {
      trackEvent(tracks.clickOpenNotifications);
    }

    this.setState(state => ({ notificationPanelOpened: !state.notificationPanelOpened }));
  }

  closeNotificationPanel = () => {
    // There seem to be some false closing triggers on initializing,
    // so we check whether it's actually open
    if (this.state.notificationPanelOpened) {
      trackEvent(tracks.clickCloseNotifications);
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

  render() {
    const { projects, location, locale, authUser, tenant } = this.props;
    const { projectsList } = projects;
    const { projectsDropdownOpened } = this.state;

    if (location && locale && tenant) {
      const isAdminPage = location.pathname.startsWith('/admin');
      const tenantLocales = tenant.attributes.settings.core.locales;
      const tenantLogo: string | null = get(tenant, 'attributes.logo.medium', null);

      return (
        <>
          {!isAdminPage &&
            <MobileNavigation />
          }

          <Container className={`${isAdminPage ? 'admin' : 'citizen'} ${'alwaysShowBorder'}`}>
            <Left>
              {tenantLogo &&
                <LogoLink to="/">
                  <Logo src={tenantLogo} alt="logo" />
                </LogoLink>
              }

              <NavigationItems>
                <NavigationItem to="/" activeClassName="active">
                  <FormattedMessage {...messages.pageOverview} />
                </NavigationItem>

                {projectsList && projectsList.length > 0 &&
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
                          <NavigationDropdownList>
                            {projectsList.map((project) => (
                              <NavigationDropdownListItem key={project.id} to={getProjectUrl(project)}>
                                {getLocalized(project.attributes.title_multiloc, locale, tenantLocales)}
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
                <StyledIdeaButton style="secondary-outlined" />
              </RightItem>

              {authUser &&
                <RightItem className="notification">
                  <NotificationMenu />
                </RightItem>
              }

              {authUser &&
                <RightItem className="usermenu">
                  <UserMenu />
                </RightItem>
              }

              {!authUser &&
                <RightItem>
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

const Data = adopt<DataProps, {}>({
  location: <GetLocation />,
  authUser: <GetAuthUser />,
  tenant: <GetTenant />,
  locale: <GetLocale />,
  projects: <GetProjects pageSize={1000} sort="new" />
});

export default (inputProps: InputProps) => <Data>{dataProps => <Navbar {...inputProps} {...dataProps} />}</Data>;
