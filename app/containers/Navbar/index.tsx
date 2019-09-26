// libraries
import React, { PureComponent, MouseEvent, FormEvent } from 'react';
import { get, includes } from 'lodash-es';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';
import { locales } from 'containers/App/constants';

// components
import NotificationMenu from './components/NotificationMenu';
import MobileNavigation from './components/MobileNavigation';
import UserMenu from './components/UserMenu';
import Icon from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';
import Dropdown from 'components/UI/Dropdown';
import LoadableLanguageSelector from 'components/Loadable/LanguageSelector';
import FeatureFlag from 'components/FeatureFlag';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProjects, { GetProjectsChildProps, PublicationStatus } from 'resources/GetProjects';

// services
import { isAdmin } from 'services/permissions/roles';

// utils
import { getProjectUrl } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { rgba, darken } from 'polished';
import { colors, media, fontSizes } from 'utils/styleUtils';

const Container = styled.header`
  width: 100%;
  height: ${({ theme }) => theme.menuHeight}px;
  display: flex;
  align-items: stretch;
  position: fixed;
  top: 0;
  background: ${({ theme }) => theme.navbarBackgroundColor || '#fff'};
  border-bottom: solid 1px ${({ theme }) => theme.navbarBorderColor || '#eaeaea'};;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.03);
  z-index: 998;

  &.hideNavbar {
    ${media.smallerThanMaxTablet`
      display: none;
    `}
  }

  &.citizenPage {
    ${media.smallerThanMaxTablet`
      position: relative;
      top: auto;
    `}
  }

  @media print {
    display: none;
  }
`;

const ContainerInner = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
  position: relative;

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 10px;
  `}
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.menuHeight}px;
`;

const LogoLink = styled(Link)`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  max-width: 100%;
  max-height: 44px;
  margin: 0;
  padding: 0px;
  cursor: pointer;
`;

const NavigationItems = styled.nav`
  height: 100%;
  display: flex;
  align-items: stretch;
  margin-left: 35px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const NavigationItem = styled(Link)`
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  height: 100%;
  position: relative;

  &:focus,
  &:hover {
    color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
    border-top-color: ${({ theme }) => theme.navbarActiveItemBorderColor ? rgba(theme.navbarActiveItemBorderColor, 0.3) : rgba(theme.colorMain, 0.3)};
  }

  &.active {
    border-top-color: ${({ theme }) => theme.navbarActiveItemBorderColor || theme.colorMain};
    border-bottom-color: ${({ theme }) => theme.navbarActiveItemBackgroundColor || rgba(theme.colorMain, 0.05)};

    &:before {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: -1;
      background-color: ${({ theme }) => theme.navbarActiveItemBackgroundColor || rgba(theme.colorMain, 0.05)};
      pointer-events: none;
    }
  }
`;

const NavigationItemText = styled.span`
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const NavigationDropdown = styled.div`
  display: flex;
  align-items: stretch;
  position: relative;
`;

const NavigationDropdownItem = styled.button`
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  fill: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 30px;
  transition: all 100ms ease;
  cursor: pointer;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
    border-top-color: ${({ theme }) => theme.navbarActiveItemBorderColor ? rgba(theme.navbarActiveItemBorderColor, 0.3) : rgba(theme.colorMain, 0.3)};
  }

  &.active {
    border-top-color: ${({ theme }) => theme.navbarActiveItemBorderColor || theme.colorMain};

    &:after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: -1;
      background-color: ${({ theme }) => theme.navbarActiveItemBackgroundColor || rgba(theme.colorMain, 0.05)};
      pointer-events: none;
    }
  }
`;

const NavigationDropdownItemIcon = styled(Icon)`
  width: 11px;
  height: 6px;
  fill: inherit;
  margin-left: 4px;
  margin-top: 3px;
`;

const ProjectsListItem = styled(Link)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-decoration: none;
  padding: 10px;
  margin-bottom: 4px;
  background: transparent;
  border-radius: ${(props: any) => props.theme.borderRadius};
  text-decoration: none;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus {
    color: #000;
    background: ${colors.clDropdownHoverBackground};
    text-decoration: none;
  }
`;

const ProjectsListFooter = styled(Link)`
  width: 100%;
  color: #fff;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 15px 15px;
  cursor: pointer;
  background: ${({ theme }) => theme.colorMain};
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 80ms ease-out;

  &:hover,
  &:focus {
    color: #fff;
    background: ${({ theme }) => darken(0.15, theme.colorMain)};
    text-decoration: none;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.menuHeight}px;
`;

const RightItem: any = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 42px;
  white-space: nowrap;

  &.noLeftMargin {
    margin-left: 0px;
  }

  ${media.smallerThanMinTablet`
    margin-left: 30px;
  `}
`;

const LogInLink = styled(NavigationItem)`
  &:focus,
  &:hover {
    border-top-color: ${({ theme }) => theme.navbarActiveItemBorderColor ? rgba(theme.navbarActiveItemBorderColor, 0.3) : rgba(theme.colorMain, 0.3)};
  }

  ${media.smallerThanMinTablet`
    padding: 0 15px;
  `}
`;

const SignUpLink = styled(NavigationItem)`
  height: calc(100% + 1px);
  color: #fff;
  background-color: ${({ theme }) => theme.navbarHighlightedItemBackgroundColor || theme.colorSecondary};
  border: none;

  &:focus,
  &:hover {
    color: #fff;
    background-color: ${({ theme }) => darken(0.12, theme.navbarHighlightedItemBackgroundColor || theme.colorSecondary)};
  }

  ${media.smallerThanMinTablet`
    padding: 0 15px;
  `}

  ${media.phone`
    padding: 0 12px;
  `}
`;

const StyledLoadableLanguageSelector = styled(LoadableLanguageSelector)`
  padding-left: 32px;

  &.notLoggedIn {
    padding-left: 20px;

    ${media.smallerThanMinTablet`
      padding-left: 10px;
    `}
  }

  ${media.smallerThanMinTablet`
    padding-left: 20px;
  `}
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
  projectsDropdownOpened: boolean;
}

class Navbar extends PureComponent<Props & WithRouterProps & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      projectsDropdownOpened: false
    };
  }

  componentDidUpdate(prevProps: Props & WithRouterProps & InjectedIntlProps) {
    if (prevProps.location !== this.props.location) {
      this.setState({ projectsDropdownOpened: false });
    }
  }

  toggleProjectsDropdown = (event: FormEvent<any>) => {
    event.preventDefault();
    this.setState(({ projectsDropdownOpened }) => ({ projectsDropdownOpened: !projectsDropdownOpened }));
  }

  trackSignUpLinkClick = () => {
    trackEventByName(tracks.clickSignUpLink.name);
  }

  removeFocus = (event: MouseEvent) => {
    event.preventDefault();
  }

  preloadLanguageSelector = () => {
    LoadableLanguageSelector.preload();
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
    // Avoids caching issue when an admin changes platform logo (I guess)
    tenantLogo = isAdmin(!isNilOrError(authUser) ? { data: authUser } : undefined) && tenantLogo ? `${tenantLogo}?${Date.now()}` : tenantLogo;
    const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');
    const firstUrlSegment = urlSegments[0];
    const secondUrlSegment = urlSegments[1];
    const lastUrlSegment = urlSegments[urlSegments.length - 1];
    const onIdeaPage = (urlSegments.length === 3 && includes(locales, firstUrlSegment) && secondUrlSegment === 'ideas' && lastUrlSegment !== 'new');
    const onInitiativePage = (urlSegments.length === 3 && includes(locales, firstUrlSegment) && secondUrlSegment === 'initiatives' && lastUrlSegment !== 'new');

    return (
      <>
        {!isAdminPage &&
          <MobileNavigation />
        }

        <Container
          id="navbar"
          className={`${isAdminPage ? 'admin' : 'citizenPage'} ${'alwaysShowBorder'} ${onIdeaPage || onInitiativePage ? 'hideNavbar' : ''}`}
        >
          <ContainerInner>
            <Left>
              {tenantLogo &&
                <LogoLink to="/" onlyActiveOnIndex={true}>
                  <Logo src={tenantLogo} alt={formatMessage(messages.logoAltText, { tenantName })} />
                </LogoLink>
              }

              <NavigationItems>
                <NavigationItem to="/" activeClassName="active" onlyActiveOnIndex={true}>
                  <NavigationItemText>
                    <FormattedMessage {...messages.pageOverview} />
                  </NavigationItemText>
                </NavigationItem>

                {tenantLocales && projectsList && projectsList.length > 0 &&
                  <NavigationDropdown>
                    <NavigationDropdownItem
                      className={`e2e-projects-dropdown-link ${secondUrlSegment === 'projects' ? 'active' : ''}`}
                      aria-haspopup="true"
                      onMouseDown={this.removeFocus}
                      onClick={this.toggleProjectsDropdown}
                    >
                      <NavigationItemText>
                        <FormattedMessage {...messages.pageProjects} />
                      </NavigationItemText>
                      <NavigationDropdownItemIcon name="dropdown" />
                    </NavigationDropdownItem>
                    <Dropdown
                      top="68px"
                      left="10px"
                      opened={projectsDropdownOpened}
                      onClickOutside={this.toggleProjectsDropdown}
                      content={(
                        <>
                          {projectsList.map((project, index) => (
                            <ProjectsListItem
                              key={project.id}
                              to={getProjectUrl(project)}
                              className={`${index === projectsList.length - 1} ? 'last' : ''`}
                            >
                              {!isNilOrError(locale) ? getLocalized(project.attributes.title_multiloc, locale, tenantLocales) : null}
                            </ProjectsListItem>
                          ))}
                        </>
                      )}
                      footer={
                        <>
                          {projectsList.length > 9 &&
                            <ProjectsListFooter to={'/projects'}>
                              <FormattedMessage {...messages.allProjects} />
                            </ProjectsListFooter>
                          }
                        </>
                      }
                    />
                  </NavigationDropdown>
                }

                <FeatureFlag name="ideas_overview">
                  <NavigationItem
                    to="/ideas"
                    activeClassName="active"
                    className={secondUrlSegment === 'ideas' ? 'active' : ''}
                  >
                    <NavigationItemText>
                      <FormattedMessage {...messages.pageIdeas} />
                    </NavigationItemText>
                  </NavigationItem>
                </FeatureFlag>

                <FeatureFlag name="initiatives">
                  <NavigationItem
                    to="/initiatives"
                    activeClassName="active"
                    className={secondUrlSegment === 'initiatives' ? 'active' : ''}
                  >
                    <NavigationItemText>
                      <FormattedMessage {...messages.pageInitiatives} />
                    </NavigationItemText>
                  </NavigationItem>
                </FeatureFlag>

                <NavigationItem to="/pages/information" activeClassName="active">
                  <NavigationItemText>
                    <FormattedMessage {...messages.pageInformation} />
                  </NavigationItemText>
                </NavigationItem>
              </NavigationItems>
            </Left>

            <Right>
              {!authUser &&

                <RightItem className="login noLeftMargin">
                  <LogInLink
                    id="e2e-login-link"
                    to="/sign-in"
                  >
                    <NavigationItemText>
                      <FormattedMessage {...messages.logIn} />
                    </NavigationItemText>
                  </LogInLink>
                </RightItem>
              }

              {!authUser &&
                <RightItem onClick={this.trackSignUpLinkClick} className="signup noLeftMargin">
                  <SignUpLink
                    to="/sign-up"
                  >
                    <NavigationItemText className="sign-up-span">
                      <FormattedMessage {...messages.signUp} />
                    </NavigationItemText>
                  </SignUpLink>
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
                <RightItem onMouseOver={this.preloadLanguageSelector} className="noLeftMargin">
                  <StyledLoadableLanguageSelector className={!authUser ? 'notLoggedIn' : ''} />
                </RightItem>
              }
            </Right>
          </ContainerInner>
        </Container>
      </>
    );
  }
}

const projectsPublicationStatuses: PublicationStatus[] = ['published', 'archived'];

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetTenant />,
  locale: <GetLocale />,
  projects: <GetProjects pageSize={250} publicationStatuses={projectsPublicationStatuses} sort="new" />
});

const NavbarWithHOCs = withRouter<Props>(injectIntl(Navbar));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <NavbarWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
