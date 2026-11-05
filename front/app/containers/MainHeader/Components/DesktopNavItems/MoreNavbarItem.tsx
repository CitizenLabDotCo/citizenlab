import React, { useState } from 'react';

import {
  Dropdown,
  Icon,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { INavbarItem } from 'api/navbar/types';
import { getNavbarChildLink } from 'api/navbar/util';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled, type TypedLinkProps } from 'utils/cl-router/Link';
import { useLocation } from 'utils/router';

import messages from '../../messages';

const DropdownListItem = typedStyled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 11px 16px;
  color: ${colors.textSecondary};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 100ms ease-out;
  overflow: hidden;

  &:hover {
    background-color: ${colors.grey300};
    color: ${colors.textSecondary};
    text-decoration: none;
  }

  &.active {
    background-color: ${colors.teal500};
    color: white;
  }
`;

const DropdownItemText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

// The toggle row for an overflowed dropdown. Matches DropdownListItem's metrics
// so the group label sits flush with the plain links around it.
const GroupButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  color: ${colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 100ms ease-out;

  &:hover {
    background-color: ${colors.grey300};
  }
`;

const GroupChevron = styled(Icon)<{ $expanded: boolean }>`
  flex: 0 0 auto;
  fill: ${colors.textSecondary};
  transition: transform 200ms ease-out;
  transform: rotate(${({ $expanded }) => ($expanded ? '90deg' : '0deg')});
`;

// Indenting the children is what keeps the grouping readable once several
// groups are open at once.
const GroupChildren = styled.div`
  > a {
    padding-left: 32px;
  }
`;

const StyledButton = styled.button`
  color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
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
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
    text-decoration: underline;
  }
`;

const MoreIcon = styled(Icon)`
  margin-left: 8px;
  fill: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
  color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
`;

interface NavbarItemProps extends TypedLinkProps {
  linkTo?: string | null;
  navigationItemTitle: Multiloc;
  onlyActiveOnIndex?: boolean;
  navbarItem?: INavbarItem;
}

interface GroupProps {
  navbarItem: INavbarItem;
  onSelectChild: () => void;
}

// An overflowed dropdown keeps its own label and expands its children in place,
// the same way dropdowns behave in the mobile menu. Splicing the children
// straight into the overflow list instead loses the label, so a child reads as a
// top-level destination and two overflowed dropdowns merge into one
// undifferentiated list.
const MoreDropdownGroup = ({ navbarItem, onSelectChild }: GroupProps) => {
  const location = useLocation();
  const dropdownChildren = navbarItem.attributes.children ?? [];

  // Start open when the current page is one of the children, so the group the
  // user is already inside isn't hidden behind a collapsed row. The panel
  // unmounts on close, so this is re-evaluated every time More is opened.
  const [expanded, setExpanded] = useState(() =>
    dropdownChildren.some(
      (child) => child.slug && location.pathname.includes(`/${child.slug}`)
    )
  );

  return (
    <>
      <GroupButton
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <DropdownItemText>
          <T value={navbarItem.attributes.title_multiloc} />
        </DropdownItemText>
        <GroupChevron
          name="chevron-right"
          width="20px"
          height="20px"
          $expanded={expanded}
        />
      </GroupButton>
      {expanded && (
        <GroupChildren>
          {dropdownChildren.map((child) => {
            const link = getNavbarChildLink(child);
            if (!link) return null;
            return (
              <DropdownListItem
                key={child.id}
                to={link.to}
                params={link.params}
                onClick={onSelectChild}
                scrollToTop
              >
                <DropdownItemText>
                  <T value={child.title_multiloc} />
                </DropdownItemText>
              </DropdownListItem>
            );
          })}
        </GroupChildren>
      )}
    </>
  );
};

interface Props {
  overflowItems: NavbarItemProps[];
}

const MoreNavbarItem = ({ overflowItems }: Props) => {
  const { formatMessage } = useIntl();
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpened(!dropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  if (overflowItems.length === 0) {
    return null;
  }

  return (
    <li style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <StyledButton onClick={toggleDropdown}>
        {formatMessage(messages.more)}
        <MoreIcon name="dots-horizontal" />
      </StyledButton>
      <Dropdown
        opened={dropdownOpened}
        onClickOutside={closeDropdown}
        top="100%"
        left="0"
        width="250px"
        zIndex="9999"
        content={
          <>
            {overflowItems.map((item, index) => {
              // A dropdown item has no link of its own, so it becomes an
              // expandable group rather than a link.
              if (item.navbarItem) {
                return (
                  <MoreDropdownGroup
                    key={item.navbarItem.id}
                    navbarItem={item.navbarItem}
                    onSelectChild={closeDropdown}
                  />
                );
              }

              return (
                <DropdownListItem
                  key={index}
                  to={
                    (item.to ?? item.linkTo) as Parameters<
                      typeof DropdownListItem
                    >[0]['to']
                  }
                  params={
                    item.params as Parameters<
                      typeof DropdownListItem
                    >[0]['params']
                  }
                  search={
                    item.search as Parameters<
                      typeof DropdownListItem
                    >[0]['search']
                  }
                  onlyActiveOnIndex={item.onlyActiveOnIndex}
                  onClick={closeDropdown}
                  scrollToTop
                >
                  <DropdownItemText>
                    <T value={item.navigationItemTitle} />
                  </DropdownItemText>
                </DropdownListItem>
              );
            })}
          </>
        }
      />
    </li>
  );
};

export default MoreNavbarItem;
