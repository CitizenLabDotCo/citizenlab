import React, { FormEvent, ReactNode } from 'react';

import {
  Dropdown,
  Icon,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import T from 'components/T';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';

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

const List = styled.ul`
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

export const ListItemWrapper = styled.li`
  list-style: none;
`;

interface Props {
  title: Multiloc;
  // e2e class added to the toggle button (e.g. 'e2e-projects-dropdown-link').
  classNamePrefix: string;
  dataTestId: string;
  isActive: boolean;
  opened: boolean;
  onToggle: (event: FormEvent) => void;
  onClose: () => void;
  // Optional id for the dropdown content list (used by e2e selectors).
  contentId?: string;
  footer?: ReactNode;
  // The dropdown's list items (rendered inside the shared <ul>).
  children: ReactNode;
}

// Shared shell for navbar dropdown items: the toggle button (with the active
// border/background treatment) plus the opened dropdown panel.
const NavbarDropdown = ({
  title,
  classNamePrefix,
  dataTestId,
  isActive,
  opened,
  onToggle,
  onClose,
  contentId,
  footer,
  children,
}: Props) => (
  <NavigationDropdown>
    <NavigationDropdownItem
      tabIndex={0}
      className={[
        classNamePrefix,
        opened ? 'opened' : 'closed',
        isActive ? 'active' : '',
      ].join(' ')}
      aria-expanded={opened}
      onMouseDown={removeFocusAfterMouseClick}
      onClick={onToggle}
      data-testid={dataTestId}
    >
      <NavigationItemBorder />
      <T value={title} />
      <NavigationDropdownItemIcon name="chevron-down" />
    </NavigationDropdownItem>
    <Dropdown
      top="68px"
      left="10px"
      opened={opened}
      onClickOutside={onClose}
      zIndex="500"
      content={<List id={contentId}>{children}</List>}
      footer={footer}
    />
  </NavigationDropdown>
);

export default NavbarDropdown;
