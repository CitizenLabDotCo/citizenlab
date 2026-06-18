import React, { useState, useEffect, FormEvent } from 'react';

import {
  Icon,
  Dropdown,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import styled from 'styled-components';

import { INavbarItem } from 'api/navbar/types';
import { getNavbarChildLink } from 'api/navbar/util';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';
import { useLocation } from 'utils/router';

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

const ItemsList = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${isRtl`
    text-align: right;
  `}
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ListItemWrapper = styled.li`
  list-style: none;
`;

interface Props {
  navbarItem: INavbarItem;
  onDropdownStateChange?: (isOpen: boolean) => void;
}

const DropdownNavbarItem = ({ navbarItem, onDropdownStateChange }: Props) => {
  const location = useLocation();
  const localize = useLocalize();
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const children = navbarItem.attributes.children;

  // The dropdown is "active" when the current page is one of its children.
  const isActive = children.some(
    (child) => child.slug && location.pathname.includes(`/${child.slug}`)
  );

  // Close the dropdown after navigating to one of its items.
  useEffect(() => {
    setDropdownOpened(false);
  }, [location.pathname]);

  useEffect(() => {
    onDropdownStateChange?.(dropdownOpened);
  }, [dropdownOpened, onDropdownStateChange]);

  const toggleDropdown = (event: FormEvent) => {
    event.preventDefault();
    setDropdownOpened((opened) => !opened);
  };

  return (
    <NavigationDropdown>
      <NavigationDropdownItem
        tabIndex={0}
        className={[
          'e2e-dropdown-navbar-item',
          dropdownOpened ? 'opened' : 'closed',
          isActive ? 'active' : '',
        ].join(' ')}
        aria-expanded={dropdownOpened}
        onMouseDown={removeFocusAfterMouseClick}
        onClick={toggleDropdown}
        data-testid="dropdown-navbar-item"
      >
        <NavigationItemBorder />
        <T value={navbarItem.attributes.title_multiloc} />
        <NavigationDropdownItemIcon name="chevron-down" />
      </NavigationDropdownItem>
      <Dropdown
        top="68px"
        left="10px"
        opened={dropdownOpened}
        onClickOutside={() => setDropdownOpened(false)}
        zIndex="500"
        content={
          <ItemsList>
            {children.map((child) => {
              const link = getNavbarChildLink(child);
              if (!link) return null;
              return (
                <ListItemWrapper key={child.id}>
                  <ProjectsListItem
                    to={link.to as Parameters<typeof ProjectsListItem>[0]['to']}
                    params={
                      link.params as Parameters<
                        typeof ProjectsListItem
                      >[0]['params']
                    }
                    onClick={() => setDropdownOpened(false)}
                    scrollToTop
                  >
                    {localize(child.title_multiloc)}
                  </ProjectsListItem>
                </ListItemWrapper>
              );
            })}
          </ItemsList>
        }
      />
    </NavigationDropdown>
  );
};

export default DropdownNavbarItem;
