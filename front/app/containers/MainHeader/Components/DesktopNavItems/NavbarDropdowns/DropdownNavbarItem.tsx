import React from 'react';

import { INavbarItem } from 'api/navbar/types';
import { getNavbarChildLink } from 'api/navbar/util';

import useLocalize from 'hooks/useLocalize';

import { useLocation } from 'utils/router';

import ProjectsListItem from '../../ProjectsListItem';

import NavbarDropdown, { ListItemWrapper } from './NavbarDropdown';
import useNavbarDropdown from './useNavbarDropdown';

interface Props {
  navbarItem: INavbarItem;
  onDropdownStateChange?: (isOpen: boolean) => void;
}

const DropdownNavbarItem = ({ navbarItem, onDropdownStateChange }: Props) => {
  const location = useLocation();
  const localize = useLocalize();
  const { opened, toggle, close } = useNavbarDropdown(onDropdownStateChange);

  const children = navbarItem.attributes.children ?? [];

  // The dropdown is "active" when the current page is one of its children.
  const isActive = children.some(
    (child) => child.slug && location.pathname.includes(`/${child.slug}`)
  );

  return (
    <NavbarDropdown
      title={navbarItem.attributes.title_multiloc}
      classNamePrefix="e2e-dropdown-navbar-item"
      dataTestId="dropdown-navbar-item"
      isActive={isActive}
      opened={opened}
      onToggle={toggle}
      onClose={close}
    >
      {children.map((child) => {
        const link = getNavbarChildLink(child);
        if (!link) return null;
        return (
          <ListItemWrapper key={child.id}>
            <ProjectsListItem
              to={link.to as Parameters<typeof ProjectsListItem>[0]['to']}
              params={
                link.params as Parameters<typeof ProjectsListItem>[0]['params']
              }
              onClick={close}
              scrollToTop
            >
              {localize(child.title_multiloc)}
            </ProjectsListItem>
          </ListItemWrapper>
        );
      })}
    </NavbarDropdown>
  );
};

export default DropdownNavbarItem;
