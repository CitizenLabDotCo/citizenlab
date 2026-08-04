import React from 'react';

import { Spinner, fontSizes } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import { Multiloc } from 'typings';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { useLocation } from 'utils/router';

import messages from '../../../messages';
import ProjectsListItem from '../../ProjectsListItem';

import NavbarDropdown, { ListItemWrapper } from './NavbarDropdown';
import useNavbarDropdown from './useNavbarDropdown';

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

  &.focus-visible,
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.tenantSecondary};
    outline-offset: 3px;
    box-shadow: 0 0 0 3px #fff;
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
  const localize = useLocalize();
  const { opened, toggle, close } = useNavbarDropdown(onDropdownStateChange);

  const { data } = useAdminPublications(
    {
      publicationStatusFilter: ['published', 'archived'],
      rootLevelOnly: true,
      removeNotAllowedParents: true,
      remove_all_unlisted: true,
    },
    { enabled: opened }
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

  return (
    <NavbarDropdown
      title={navigationItemTitle}
      classNamePrefix="e2e-projects-dropdown-link"
      dataTestId="admin-publications-navbar-item"
      isActive={isActive}
      opened={opened}
      onToggle={toggle}
      onClose={close}
      contentId="e2e-projects-dropdown-content"
      footer={
        totalProjectsListLength > 9 ? (
          <ProjectsListFooter
            to="/projects"
            id="e2e-all-projects-link"
            scrollToTop
          >
            <FormattedMessage {...messages.allProjects} />
          </ProjectsListFooter>
        ) : undefined
      }
    >
      {adminPublications ? (
        adminPublications.map((item) => (
          <ListItemWrapper key={item.id}>
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
          </ListItemWrapper>
        ))
      ) : (
        <Spinner />
      )}
    </NavbarDropdown>
  );
};

export default AdminPublicationsNavbarItem;
