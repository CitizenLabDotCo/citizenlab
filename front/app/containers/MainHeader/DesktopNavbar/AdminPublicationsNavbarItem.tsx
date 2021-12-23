import React, { useState, useEffect, FormEvent } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import { Icon, Dropdown } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import Outlet from 'components/Outlet';
import ProjectsListItem from '../ProjectsListItem';
import T from 'components/T';

// hooks
import useAdminPublications, {
  IAdminPublicationContent,
} from 'hooks/useAdminPublications';
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { rgba, darken } from 'polished';
import { fontSizes, isRtl } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

const NavigationDropdown = styled.li`
  display: flex;
  align-items: stretch;
  position: relative;
`;

const NavigationItemBorder = styled.div`
  height: 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
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
  white-space: nowrap;

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

interface Props {
  linkTo: string;
  navigationItemTitle: Multiloc;
}

const AdminPublicationsNavbarItem = ({
  linkTo,
  navigationItemTitle,
  location,
}: Props & WithRouterProps) => {
  const [projectsDropdownOpened, setProjectsDropdownOpened] = useState(false);
  const localize = useLocalize();
  const { list: adminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'archived'],
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });
  const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');
  const secondUrlSegment = urlSegments[1];
  const totalProjectsListLength = !isNilOrError(adminPublications)
    ? adminPublications.length
    : 0;

  useEffect(() => {
    setProjectsDropdownOpened(false);
  }, [location, setProjectsDropdownOpened]);

  const toggleProjectsDropdown = (event: FormEvent) => {
    event.preventDefault();
    setProjectsDropdownOpened(
      (prevProjectsDropdownOpened) => !prevProjectsDropdownOpened
    );
  };

  if (!isNilOrError(adminPublications) && adminPublications.length > 0) {
    return (
      <NavigationDropdown>
        <NavigationDropdownItem
          tabIndex={0}
          className={[
            'e2e-projects-dropdown-link',
            projectsDropdownOpened ? 'opened' : 'closed',
            secondUrlSegment === 'projects' || secondUrlSegment === 'folders'
              ? 'active'
              : '',
          ].join(' ')}
          aria-expanded={projectsDropdownOpened}
          onMouseDown={removeFocusAfterMouseClick}
          onClick={toggleProjectsDropdown}
        >
          <NavigationItemBorder />
          <T value={navigationItemTitle} />
          <NavigationDropdownItemIcon name="dropdown" />
        </NavigationDropdownItem>
        <Dropdown
          top="68px"
          left="10px"
          opened={projectsDropdownOpened}
          onClickOutside={toggleProjectsDropdown}
          content={
            <ProjectsList>
              {adminPublications.map((item: IAdminPublicationContent) => (
                <React.Fragment key={item.publicationId}>
                  {item.publicationType === 'project' && (
                    <ProjectsListItem
                      to={`${linkTo}/${item.attributes.publication_slug}`}
                    >
                      {localize(item.attributes.publication_title_multiloc)}
                    </ProjectsListItem>
                  )}
                  <Outlet
                    id="app.containers.Navbar.projectlist.item"
                    publication={item}
                    localize={localize}
                  />
                </React.Fragment>
              ))}
            </ProjectsList>
          }
          footer={
            <>
              {totalProjectsListLength > 9 && (
                <ProjectsListFooter to={linkTo}>
                  <FormattedMessage {...messages.allProjects} />
                </ProjectsListFooter>
              )}
            </>
          }
        />
      </NavigationDropdown>
    );
  }

  return null;
};

export default withRouter(AdminPublicationsNavbarItem);
