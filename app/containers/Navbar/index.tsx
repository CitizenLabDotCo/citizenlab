// libraries
import React from 'react';
import { get } from 'lodash';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// components
import NotificationMenu from './components/NotificationMenu';
import LanguageSelector from './components/LanguageSelector';
import MobileNavigation from './components/MobileNavigation';
import UserMenu from './components/UserMenu';
import IdeaButton from 'components/IdeaButton';
import Icon from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';
import Dropdown from 'components/UI/Dropdown';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// services
import { updateLocale } from 'services/locale';
import { isAdmin } from 'services/permissions/roles';

// utils
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';
import { getProjectUrl } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled, { css, } from 'styled-components';
import { darken, rgba, ellipsis } from 'polished';
import { colors, media } from 'utils/styleUtils';

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
  ${ellipsis('20rem') as any}
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
  &:hover,
  &:focus {
    color: #000;
  }
`;

const NavigationDropdown = styled.div`
  position: relative;
  margin-right: 40px;
`;

const NavigationDropdownItemIcon = styled(Icon)`
  height: 6px;
  width: 11px;
  fill: inherit;
  margin-left: 4px;
  margin-top: 3px;
`;

const NavigationDropdownItem = styled.button`
  align-items: center;
  color: #999;
  display: flex;
  fill: #999;
  font-size: 17px;
  font-weight: 400;
  transition: all 100ms ease-out;
  cursor: pointer;

  &:hover,
  &:focus {
    color: #000;
    fill: #000;
  }
`;

const ProjectsListItem = styled(Link)`
  color: ${colors.label};
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  text-decoration: none;
  margin-right: 5px;
  padding: 10px;
  background: #fff;
  border-radius: 5px;

  &:hover,
  &:focus {
    color: #000;
    text-decoration: none;
    background: #f6f6f6;
  }
`;

const ProjectsListFooter = styled(Link)`
  width: 100%;
  color: ${colors.label};
  font-size: 17px;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 15px 15px;
  cursor: pointer;
  background: ${rgba(colors.label, 0.12)};
  border-radius: 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 80ms ease-out;

  &:hover,
  &:focus {
    color: ${darken(0.2, colors.label)};
    background: ${rgba(colors.label, 0.22)};
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
    font-size: 17px !important;
    color: ${(props) => props.theme.colorMain};
  }
`;

const LoginLink = styled(Link)`
  color: ${(props) => props.theme.colors.label};
  font-size: 17px;
  font-weight: 400;
  padding: 0;

  &:hover {
    color: ${(props) => darken(0.2, props.theme.colors.label)};
  }
`;

interface InputProps {}

interface DataProps {
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

class Navbar extends React.PureComponent<Props & WithRouterProps & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      notificationPanelOpened: false,
      projectsDropdownOpened: false
    };
  }

  componentDidUpdate(prevProps: Props & WithRouterProps & InjectedIntlProps) {
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
    event.stopPropagation();
    this.setState(({ projectsDropdownOpened }) => ({ projectsDropdownOpened: !projectsDropdownOpened }));
  }

  handleProjectsDropdownOnClickOutside = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ projectsDropdownOpened: false });
  }

  handleLanguageChange (_event, { value }) {
    updateLocale(value);
  }

  render() {
    const {
      projects,
      location,
      locale,
      authUser,
      tenant,
      intl: { formatMessage }
    } = this.props;
    const { projectsList } = projects;
    const { projectsDropdownOpened } = this.state;
    const isAdminPage = (location && location.pathname.startsWith('/admin'));
    const tenantLocales = !isNilOrError(tenant) ? tenant.attributes.settings.core.locales : [];
    const tenantName = (!isNilOrError(tenant) && !isNilOrError(locale) && getLocalized(tenant.attributes.settings.core.organization_name, locale, tenantLocales));
    let tenantLogo = !isNilOrError(tenant) ? get(tenant.attributes.logo, 'medium') : null;
    tenantLogo = isAdmin(!isNilOrError(authUser) ? { data: authUser } : undefined) && tenantLogo ? `${tenantLogo}?${Date.now()}` : tenantLogo;

    return (
      <>
        {!isAdminPage &&
          <MobileNavigation />
        }

        <Container role="banner" className={`${isAdminPage ? 'admin' : 'citizen'} ${'alwaysShowBorder'}`}>
          <Left>
            {tenantLogo &&
              <LogoLink to="/" onlyActiveOnIndex={true}>
                <Logo src={tenantLogo} alt={formatMessage(messages.logoAltText, { tenantName })} />
              </LogoLink>
            }

            <NavigationItems>
              <NavigationItem to="/" activeClassName="active" onlyActiveOnIndex={true}>
                <FormattedMessage {...messages.pageOverview} />
              </NavigationItem>

              {tenantLocales && projectsList && projectsList.length > 0 &&
                <NavigationDropdown>
                  <NavigationDropdownItem aria-haspopup="true" onClick={this.handleProjectsDropdownToggle}>
                    <FormattedMessage {...messages.pageProjects} />
                    <NavigationDropdownItemIcon name="dropdown" />
                  </NavigationDropdownItem>

                  <Dropdown
                    opened={projectsDropdownOpened}
                    content={(
                      <>
                        {projectsList.map((project) => (
                          <ProjectsListItem key={project.id} to={getProjectUrl(project)}>
                            {!isNilOrError(locale) ? getLocalized(project.attributes.title_multiloc, locale, tenantLocales) : null}
                          </ProjectsListItem>
                        ))}
                      </>
                    )}
                    footer={(
                      <ProjectsListFooter to={`/projects`}>
                        <FormattedMessage {...messages.allProjects} />
                      </ProjectsListFooter>
                    )}
                    toggleOpened={this.handleProjectsDropdownToggle}
                    maxHeight="180px"
                  />
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
              <StyledIdeaButton style="secondary-outlined" size="1" />
            </RightItem>

            {!authUser &&
              <RightItem>
                <LoginLink to="/sign-in" id="e2e-login-link">
                  <FormattedMessage {...messages.login} />
                </LoginLink>
              </RightItem>
            }

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

            {tenantLocales.length > 1 && locale &&
              <RightItem>
                <LanguageSelector localeOptions={tenantLocales} currentLocale={locale} />
              </RightItem>
            }

          </Right>
        </Container>
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetTenant />,
  locale: <GetLocale />,
  projects: <GetProjects pageSize={250} sort="new" />
});

const NavBarWithHoCs = withRouter(injectIntl(Navbar));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <NavBarWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
