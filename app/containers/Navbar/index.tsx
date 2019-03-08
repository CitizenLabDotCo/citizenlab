// libraries
import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';
import { trackEventByName } from 'utils/analytics';

// components
import NotificationMenu from './components/NotificationMenu';
import LanguageSelector from './components/LanguageSelector';
import MobileNavigation from './components/MobileNavigation';
import UserMenu from './components/UserMenu';
import Icon from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';
import Dropdown from 'components/UI/Dropdown';

// analytics
import tracks from './tracks';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

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

const Container = styled.div`
  width: 100%;
  height: ${(props) => props.theme.menuHeight}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
  position: fixed;
  top: 0;
  background: #fff;
  border-bottom: solid 1px #eaeaea;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.03);
  z-index: 999;
  -webkit-transform: translateZ(0);

  &.citizen {
    ${media.smallerThanMaxTablet`
      position: relative;
      top: auto;
    `}
  }

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 10px;
  `}

  @media print {
    display: none;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  height: ${(props) => props.theme.menuHeight}px;
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
  max-height: 46px;
  margin: 0;
  padding: 0px;
  cursor: pointer;
`;

const NavigationItems = styled.div`
  height: 100%;
  display: flex;
  align-items: stretch;
  margin-left: 35px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const NavigationItem = styled(Link)`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
  outline: none;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  height: 100%;
  position: relative;

  &:focus,
  &:hover {
    color: ${(props: any) => props.theme.colorText};
    border-top-color: ${(props) => rgba(props.theme.colorMain, .3)};
  }

  &.active {
    border-top-color: ${(props) => props.theme.colorMain};
    border-bottom-color: ${(props) => rgba(props.theme.colorMain, 0.05)};

    &:after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: 2;
      background-color: ${(props) => rgba(props.theme.colorMain, 0.05)};
      pointer-events: none;
    }
  }
`;

const NavigationItemText = styled.span`
  white-space: nowrap;

  &:not(.sign-up-span) {
    background-color: #fff;
  }

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
  color: ${(props: any) => props.theme.colorText};
  fill: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 30px;
  transition: all 100ms ease;
  outline: none;
  cursor: pointer;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;


  &:hover,
  &:focus {
    color: ${(props: any) => props.theme.colorText};
    border-top-color: ${(props) => rgba(props.theme.colorMain, .3)};
  }

  &.active {
    border-top-color: ${(props) => props.theme.colorMain};

    &:after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: 2;
      background-color: ${(props) => rgba(props.theme.colorMain, 0.05)};
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
  background: #fff;
  border-radius: 5px;
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
  background: ${(props) => props.theme.colorMain};
  border-radius: 3px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 80ms ease-out;

  &:hover,
  &:focus {
    color: #fff;
    background: ${(props) => darken(0.15, props.theme.colorMain)};
    text-decoration: none;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  height: ${(props) => props.theme.menuHeight}px;
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
    margin-left: 25px;
  `}
`;

const LogInLink = NavigationItem.extend`
  &:focus,
  &:hover {
    border-top-color: ${({ theme }) => rgba(theme.colorSecondary, .3)};
  }

  ${media.smallerThanMinTablet`
    padding: 0 15px;
  `}
`;

const SignUpLink = NavigationItem.extend`
  color: #fff;
  background-color: ${(props) => props.theme.colorSecondary};
  border: none;

  &:focus,
  &:hover {
    color: #fff;
    background-color: ${(props) => darken(0.12, props.theme.colorSecondary)};
  }

  ${media.smallerThanMinTablet`
    padding: 0 15px;
  `}

  ${media.phone`
    padding: 0 12px;
  `}
`;

const StyledLanguageSelector = styled(LanguageSelector)`
  padding-left: 36px;

  &.notLoggedIn {
    padding-left: 20px;

    ${media.smallerThanMinTablet`
      padding-left: 10px;
    `}
  }

  ${media.smallerThanMinTablet`
    padding-left: 15px;
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

  toggleProjectsDropdown = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState(({ projectsDropdownOpened }) => ({ projectsDropdownOpened: !projectsDropdownOpened }));
  }

  trackSignUpLinkClick = () => {
    trackEventByName(tracks.clickSignUpLink.name);
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
    const secondUrlSegment = location.pathname.replace(/^\/+/g, '').split('/')[1];

    return (
      <>
        {!isAdminPage &&
          <MobileNavigation />
        }

        <Container role="navigation" className={`${isAdminPage ? 'admin' : 'citizen'} ${'alwaysShowBorder'}`}>
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

              <NavigationItem to="/ideas" activeClassName="active">
                <NavigationItemText>
                  <FormattedMessage {...messages.pageIdeas} />
                </NavigationItemText>
              </NavigationItem>

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
              <RightItem className="noLeftMargin">
                <StyledLanguageSelector className={!authUser ? 'notLoggedIn' : ''} />
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
  projects: <GetProjects pageSize={250} publicationStatuses={['published', 'archived']} sort="new" />
});

const NavbarWithHOCs = withRouter<Props>(injectIntl(Navbar));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <NavbarWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
