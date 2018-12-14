// libraries
import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// components
import NotificationMenu from './components/NotificationMenu';
import LanguageSelector from './components/LanguageSelector';
import MobileNavigation from './components/MobileNavigation';
import UserMenu from './components/UserMenu';
import Icon from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';
import Dropdown from 'components/UI/Dropdown';
import Button from 'components/UI/Button';

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
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.03);
  z-index: 999;

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

  @media print {
    display: none;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  height: 100%;
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
  align-items: stretch;
  margin-left: 35px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const NavigationItem = styled(Link)`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.base}px;
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

  &:focus,
  &:hover {
    color: ${colors.label};
    border-top-color: ${(props) => rgba(props.theme.colorMain, .3)};
  }

  &.active {
    background-color: ${(props) => rgba(props.theme.colorMain, .05)};
    border-top-color: ${(props) => props.theme.colorMain};
  }
`;

const NavigationItemText = styled.span`
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
  color: ${colors.label};
  fill: ${colors.label};
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
    color: ${colors.label};
    border-top-color: ${(props) => rgba(props.theme.colorMain, .3)};
  }

  &.active {
    background-color: ${(props) => rgba(props.theme.colorMain, .05)};
    border-top-color: ${(props) => props.theme.colorMain};
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
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 22px;
  text-decoration: none;
  padding: 10px;
  margin-bottom: 3px;
  background: #fff;
  border-radius: 5px;
  padding: 10px;
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
  height: 100%;
`;

const RightItem: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  &.signup {
    padding: 0;
  }

  &.notification {
    ${media.smallerThanMinTablet`
      display: none;
    `}
  }

  &.usermenu,
  &.notification {
    padding: 0 15px;
  }

  &.languageselector {
    margin-left: 20px;
  }

  ${media.smallerThanMinTablet`
    padding-left: 15px;
  `}
`;

const LogInButton = NavigationItem.extend``;

const SignUpButton = styled(Button)`
  color: #fff;
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.base}px;
  padding: 0;

  &:hover {
    color: ${colors.text};
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
                    className={secondUrlSegment === 'projects' ? 'active' : ''}
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
                    footer={(
                      <ProjectsListFooter to={'/projects'}>
                        <FormattedMessage {...messages.allProjects} />
                      </ProjectsListFooter>
                    )}
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

              <RightItem className="login">
                <LogInButton
                  id="e2e-login-link"
                  to="/sign-in"
                >
                  <NavigationItemText>
                    <FormattedMessage {...messages.logIn} />
                  </NavigationItemText>
                </LogInButton>
              </RightItem>
            }

            {!authUser &&
              <RightItem className="signup">
                <SignUpButton
                  padding="0 30px"
                  fontWeight="500"
                  fullHeight
                  linkTo="/sign-up"
                >
                  <NavigationItemText>
                    <FormattedMessage {...messages.signUp} />
                  </NavigationItemText>
                </SignUpButton>
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
              <RightItem className="languageselector">
                <LanguageSelector />
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

const NavbarWithHOCs = withRouter(injectIntl(Navbar));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <NavbarWithHOCs {...(inputProps as InputProps & WithRouterProps & InjectedIntlProps)} {...dataProps} />}
  </Data>
);
