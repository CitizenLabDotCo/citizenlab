import React, { useState, useEffect, FormEvent } from 'react';

import {
  Icon,
  Dropdown,
  fontSizes,
  isRtl,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { rgba, darken } from 'polished';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';
import { useLocation } from 'utils/router';

import messages from '../../messages';
import ProjectsListItem from '../ProjectsListItem';

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
  color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
  fill: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
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
    color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
    text-decoration: underline;

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor
          ? rgba(theme.navbarActiveItemBorderColor, 0.3)
          : rgba(theme.colors.tenantPrimary, 0.3)};
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
        theme.navbarActiveItemBackgroundColor ||
        rgba(theme.colors.tenantPrimary, 0.05)};
      pointer-events: none;
    }

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor || theme.colors.tenantPrimary};
    }
  }
  ${isRtl`
     flex-direction: row-reverse;
  `}
`;

const NavigationDropdownItemIcon = styled(Icon)`
  fill: inherit;
  ${isRtl`
    margin-left: 0;
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

const ProjectsListFooter = typedStyled(Link)`
  width: 100%;
  color: #fff;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 15px 15px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.tenantSecondary};
  border-radius: ${(props) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 80ms ease-out;

  &:hover,
  &:focus {
    color: #fff;
    background: ${({ theme }) => darken(0.15, theme.colors.tenantSecondary)};
    text-decoration: none;
  }
`;

interface Props {
  linkTo: string;
  navigationItemTitle: Multiloc;
  onDropdownStateChange?: (isOpen: boolean) => void;
}

const AdminPublicationsNavbarItem = ({
  navigationItemTitle,
  onDropdownStateChange,
}: Props) => {
  const location = useLocation();
  const [projectsDropdownOpened, setProjectsDropdownOpened] = useState(false);
  const localize = useLocalize();

  const { data } = useAdminPublications(
    {
      publicationStatusFilter: ['published', 'archived'],
      rootLevelOnly: true,
      removeNotAllowedParents: true,
      remove_all_unlisted: true,
    },
    { enabled: projectsDropdownOpened }
  );

  const adminPublications = data?.pages.map((page) => page.data).flat();

  const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');
  const secondUrlSegment = urlSegments[1];
  const thirdUrlSegment = urlSegments[2];

  const isActive =
    (secondUrlSegment === 'projects' || secondUrlSegment === 'folders') &&
    !thirdUrlSegment;

  const totalProjectsListLength = adminPublications
    ? adminPublications.length
    : 0;

  useEffect(() => {
    setProjectsDropdownOpened(false);
  }, [location.pathname]);

  // Notify parent component of dropdown state changes
  useEffect(() => {
    onDropdownStateChange?.(projectsDropdownOpened);
  }, [projectsDropdownOpened, onDropdownStateChange]);

  const toggleProjectsDropdown = (event: FormEvent) => {
    event.preventDefault();
    setProjectsDropdownOpened(
      (prevProjectsDropdownOpened) => !prevProjectsDropdownOpened
    );
  };

  return (
    <NavigationDropdown>
      <NavigationDropdownItem
        tabIndex={0}
        className={[
          'e2e-projects-dropdown-link',
          projectsDropdownOpened ? 'opened' : 'closed',
          isActive ? 'active' : '',
        ].join(' ')}
        aria-expanded={projectsDropdownOpened}
        onMouseDown={removeFocusAfterMouseClick}
        onClick={toggleProjectsDropdown}
        data-testid="admin-publications-navbar-item"
      >
        <NavigationItemBorder />
        <T value={navigationItemTitle} />
        <NavigationDropdownItemIcon name="chevron-down" />
      </NavigationDropdownItem>
      <Dropdown
        top="68px"
        left="10px"
        opened={projectsDropdownOpened}
        onClickOutside={() => setProjectsDropdownOpened(false)}
        zIndex="500"
        content={
          <ProjectsList id="e2e-projects-dropdown-content">
            {adminPublications ? (
              <>
                {adminPublications.map((item) => (
                  <React.Fragment key={item.id}>
                    {item.relationships.publication.data.type === 'project' && (
                      <ProjectsListItem
                        to="/projects/$slug"
                        params={{ slug: item.attributes.publication_slug }}
                        scrollToTop
                      >
                        {localize(item.attributes.publication_title_multiloc)}
                      </ProjectsListItem>
                    )}
                    {item.relationships.publication.data.type === 'folder' && (
                      <ProjectsListItem
                        to="/folders/$slug"
                        params={{ slug: item.attributes.publication_slug }}
                        scrollToTop
                      >
                        {localize(item.attributes.publication_title_multiloc)}
                      </ProjectsListItem>
                    )}
                  </React.Fragment>
                ))}
              </>
            ) : (
              <Spinner />
            )}
          </ProjectsList>
        }
        footer={
          <>
            {totalProjectsListLength > 9 && (
              <ProjectsListFooter
                to="/projects"
                id="e2e-all-projects-link"
                scrollToTop
              >
                <FormattedMessage {...messages.allProjects} />
              </ProjectsListFooter>
            )}
          </>
        }
      />
    </NavigationDropdown>
  );
};

export default AdminPublicationsNavbarItem;
