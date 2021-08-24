// libraries
import React, { PureComponent, MouseEvent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { withRouter, WithRouterProps } from 'react-router';

// components
import { Icon, Dropdown } from 'cl2-component-library';
import Link from 'utils/cl-router/Link';
import FeatureFlag from 'components/FeatureFlag';
import Outlet from 'components/Outlet';
import ProjectsListItem from '../ProjectsListItem';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAdminPublications, {
  GetAdminPublicationsChildProps,
} from 'resources/GetAdminPublications';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { openSignUpInModal } from 'components/SignUpIn/events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from '../messages';

// style
import styled from 'styled-components';
import { rgba, darken } from 'polished';
import { media, fontSizes, isRtl } from 'utils/styleUtils';

const NavigationItems = styled.nav`
  height: 100%;
  display: flex;
  align-items: stretch;
  margin-left: 35px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
  ${isRtl`
    margin-right: 35px;
    margin-left: 0;
    flex-direction: row-reverse;
  `}
`;

const NavigationItemBorder = styled.div`
  height: 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: 'transparent';
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
  transition: all 100ms ease-out;
  height: 100%;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
    text-decoration: underline;

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor
          ? rgba(theme.navbarActiveItemBorderColor, 0.3)
          : rgba(theme.colorMain, 0.3)};
    }
  }

  &.active {
    &:before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: -1;
      background-color: ${({ theme }) =>
        theme.navbarActiveItemBackgroundColor || rgba(theme.colorMain, 0.05)};
      pointer-events: none;
    }

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor || theme.colorMain};
    }
  }
`;

const NavigationItemText = styled.span`
  white-space: nowrap;
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
  transition: all 100ms ease-out;
  cursor: pointer;
  position: relative;

  &:hover,
  &.opened {
    color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
    text-decoration: underline;

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor
          ? rgba(theme.navbarActiveItemBorderColor, 0.3)
          : rgba(theme.colorMain, 0.3)};
    }
  }

  &.active {
    &:after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: -1;
      background-color: ${({ theme }) =>
        theme.navbarActiveItemBackgroundColor || rgba(theme.colorMain, 0.05)};
      pointer-events: none;
    }

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor || theme.colorMain};
    }
  }
  ${isRtl`
     flex-direction: row-reverse;
  `}
`;

const NavigationDropdownItemIcon = styled(Icon)`
  width: 11px;
  height: 6px;
  fill: inherit;
  margin-left: 4px;
  margin-top: 3px;
  ${isRtl`
    margin-left: 0;
    margin-right: 4px;
  `}
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${isRtl`
    text-align: right;
  `}
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
  background: ${({ theme }) => theme.colorSecondary};
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 80ms ease-out;

  &:hover,
  &:focus {
    color: #fff;
    background: ${({ theme }) => darken(0.15, theme.colorSecondary)};
    text-decoration: none;
  }
`;

interface InputProps {
  setRef?: (arg: HTMLElement) => void | undefined;
}

interface DataProps {
  locale: GetLocaleChildProps;
  adminPublications: GetAdminPublicationsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  projectsDropdownOpened: boolean;
}

class Navbar extends PureComponent<
  Props & WithRouterProps & InjectedLocalized,
  State
> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      projectsDropdownOpened: false,
    };
  }

  componentDidUpdate(prevProps: Props & WithRouterProps) {
    if (prevProps.location !== this.props.location) {
      this.setState({ projectsDropdownOpened: false });
    }
  }

  toggleProjectsDropdown = (event: FormEvent) => {
    event.preventDefault();
    this.setState(({ projectsDropdownOpened }) => ({
      projectsDropdownOpened: !projectsDropdownOpened,
    }));
  };

  removeFocus = (event: MouseEvent) => {
    event.preventDefault();
  };

  signIn = () => {
    openSignUpInModal({ flow: 'signin' });
  };

  signUp = () => {
    openSignUpInModal({ flow: 'signup' });
  };

  render() {
    const { location, localize, adminPublications } = this.props;
    const { projectsDropdownOpened } = this.state;
    const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');
    const secondUrlSegment = urlSegments[1];

    const totalProjectsListLength =
      !isNilOrError(adminPublications) && adminPublications.list
        ? adminPublications.list.length
        : 0;

    return (
      <NavigationItems>
        <NavigationItem
          to="/"
          activeClassName="active"
          onlyActiveOnIndex={true}
        >
          <NavigationItemBorder />
          <NavigationItemText>
            <FormattedMessage {...messages.pageOverview} />
          </NavigationItemText>
        </NavigationItem>

        {!isNilOrError(adminPublications) &&
          adminPublications.list &&
          adminPublications.list.length > 0 && (
            <NavigationDropdown>
              <NavigationDropdownItem
                tabIndex={0}
                className={`e2e-projects-dropdown-link ${
                  projectsDropdownOpened ? 'opened' : 'closed'
                } ${
                  secondUrlSegment === 'projects' ||
                  secondUrlSegment === 'folders'
                    ? 'active'
                    : ''
                }`}
                aria-expanded={projectsDropdownOpened}
                onMouseDown={this.removeFocus}
                onClick={this.toggleProjectsDropdown}
              >
                <NavigationItemBorder />
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
                content={
                  <ProjectsList>
                    {adminPublications.list.map(
                      (item: IAdminPublicationContent) => (
                        <React.Fragment key={item.publicationId}>
                          {item.publicationType === 'project' && (
                            <ProjectsListItem
                              to={`/projects/${item.attributes.publication_slug}`}
                            >
                              {localize(
                                item.attributes.publication_title_multiloc
                              )}
                            </ProjectsListItem>
                          )}
                          <Outlet
                            id="app.containers.Navbar.projectlist.item"
                            publication={item}
                            localize={localize}
                          />
                        </React.Fragment>
                      )
                    )}
                  </ProjectsList>
                }
                footer={
                  <>
                    {totalProjectsListLength > 9 && (
                      <ProjectsListFooter to={'/projects'}>
                        <FormattedMessage {...messages.allProjects} />
                      </ProjectsListFooter>
                    )}
                  </>
                }
              />
            </NavigationDropdown>
          )}

        <FeatureFlag name="ideas_overview">
          <NavigationItem
            to="/ideas"
            activeClassName="active"
            className={secondUrlSegment === 'ideas' ? 'active' : ''}
          >
            <NavigationItemBorder />
            <NavigationItemText>
              <FormattedMessage {...messages.pageInputs} />
            </NavigationItemText>
          </NavigationItem>
        </FeatureFlag>

        <FeatureFlag name="initiatives">
          <NavigationItem
            to="/initiatives"
            activeClassName="active"
            className={secondUrlSegment === 'initiatives' ? 'active' : ''}
          >
            <NavigationItemBorder />
            <NavigationItemText>
              <FormattedMessage {...messages.pageInitiatives} />
            </NavigationItemText>
          </NavigationItem>
        </FeatureFlag>

        <FeatureFlag name="events_page">
          <NavigationItem
            to="/events"
            activeClassName="active"
            className={secondUrlSegment === 'events' ? 'active' : ''}
          >
            <NavigationItemBorder />
            <NavigationItemText>
              <FormattedMessage {...messages.pageEvents} />
            </NavigationItemText>
          </NavigationItem>
        </FeatureFlag>

        <NavigationItem to="/pages/information" activeClassName="active">
          <NavigationItemBorder />
          <NavigationItemText>
            <FormattedMessage {...messages.pageInformation} />
          </NavigationItemText>
        </NavigationItem>
        <NavigationItem to="/pages/faq" activeClassName="active">
          <NavigationItemBorder />
          <NavigationItemText>
            <FormattedMessage {...messages.pageFaq} />
          </NavigationItemText>
        </NavigationItem>
      </NavigationItems>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  adminPublications: (
    <GetAdminPublications
      publicationStatusFilter={['published', 'archived']}
      rootLevelOnly
      removeNotAllowedParents
    />
  ),
});

const NavbarWithHOCs = injectLocalize<Props>(withRouter(Navbar));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <NavbarWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
