import React, { useState } from 'react';

import {
  Dropdown,
  Icon,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';

import messages from '../../messages';

import type { LinkProps } from '@tanstack/react-router';

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

interface NavbarItemProps {
  to?: LinkProps['to'];
  params?: Record<string, string>;
  search?: Record<string, unknown>;
  linkTo?: string;
  navigationItemTitle: Multiloc;
  onlyActiveOnIndex?: boolean;
}

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
        <Icon name="dots-horizontal" ml="8px" />
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
            {overflowItems.map((item, index) => (
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
            ))}
          </>
        }
      />
    </li>
  );
};

export default MoreNavbarItem;
