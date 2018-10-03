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
import { isAdmin } from 'services/permissions/roles';

// utils
import { getProjectUrl } from 'services/projects';
import { isNilOrError, isMobileDevice } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled, { css, } from 'styled-components';
import { darken } from 'polished';
import { colors, media, fontSizes } from 'utils/styleUtils';

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
  height: 76px;
  display: flex;
  align-items: stretch;
  margin-left: 35px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const NavigationItem = styled(Link)`
  color: ${colors.label};
  font-size: ${fontSizes.medium}px;
  line-height: ${fontSizes.medium}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
  outline: none;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;

  &:not(:last-child) {
    margin-right: 40px;
  }

  &.active {
    color: ${(props) => props.theme.colorMain};
    border-bottom-color: ${(props) => props.theme.colorMain};
  }

  &:focus,
  &:hover {
    color: ${(props) => props.theme.colorMain};
  }
`;

const NavigationDropdown = styled.div`
  display: flex;
  align-items: stretch;
  position: relative;
  margin-right: 40px;
`;

const NavigationDropdownItem = styled.button`
  color: ${colors.label};
  fill: ${colors.label};
  font-size: ${fontSizes.medium}px;
  font-weight: 400;
  line-height: ${fontSizes.medium}px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  transition: all 100ms ease;
  outline: none;
  cursor: pointer;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;

  &.active {
    color: ${(props) => props.theme.colorMain};
    fill: ${(props) => props.theme.colorMain};
    border-bottom-color: ${(props) => props.theme.colorMain};
  }

  &:hover,
  &:focus {
    color: ${(props) => props.theme.colorMain};
    fill: ${(props) => props.theme.colorMain};
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
  font-size: ${fontSizes.medium}px;
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
  font-size: ${fontSizes.medium}px;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 15px 15px;
  cursor: pointer;
  background: ${(props) => props.theme.colorMain};
  border-radius: 5px;
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

  ${media.smallerThanMinTablet`
    margin-right: 10px;
  `}
`;

const RightItem: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-left: 30px;

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
  a,
  button {
    &:hover,
    &:focus {
      border-color: ${darken(0.2, colors.separation)} !important;
    }
  }

  .Button {
    border: solid 2px ${colors.separation} !important;
    padding-left: 18px;
    padding-right: 18px;

    ${media.smallerThanMinTablet`
      padding-left: 10px;
      padding-right: 10px;
    `}
  }

  .buttonText {
    font-size: ${fontSizes.medium}px !important;
    color: ${(props) => props.theme.colorMain};
  }
`;

const LoginLink = styled(Link)`
  color: ${colors.label};
  font-size: ${fontSizes.medium}px;
  font-weight: 400;
  padding: 0;

  &:hover {
    color: ${colors.clGreyHover};
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
    const mobileDevice = isMobileDevice();

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
                  <NavigationDropdownItem
                    className={secondUrlSegment === 'projects' ? 'active' : ''}
                    aria-haspopup="true"
                    onClick={this.toggleProjectsDropdown}
                  >
                    <FormattedMessage {...messages.pageProjects} />
                    <NavigationDropdownItemIcon name="dropdown" />
                  </NavigationDropdownItem>

                  <Dropdown
                    top="62px"
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
                <FormattedMessage {...messages.pageIdeas} />
              </NavigationItem>

              <NavigationItem to="/pages/information" activeClassName="active">
                <FormattedMessage {...messages.pageInformation} />
              </NavigationItem>
            </NavigationItems>
          </Left>

          <Right>
            {!mobileDevice &&
              <RightItem className="addIdea" loggedIn={authUser !== null}>
                <StyledIdeaButton style="secondary-outlined" size="1" />
              </RightItem>
            }

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
  projects: <GetProjects pageSize={250} publicationStatuses={['published', 'archived']} sort="new" />
});

const NavbarWithHOCs = withRouter(injectIntl(Navbar));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <NavbarWithHOCs {...(inputProps as InputProps & WithRouterProps & InjectedIntlProps)} {...dataProps} />}
  </Data>
);
