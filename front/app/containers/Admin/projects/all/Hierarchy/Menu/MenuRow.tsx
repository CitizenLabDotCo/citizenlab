import React, { KeyboardEvent, MouseEvent, ReactNode } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';

import Link, { typedStyled, type WrapperTo } from 'utils/cl-router/Link';

// A page a menu row opens.
export type MenuLink = {
  to: WrapperTo;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
};

// Rows as dense as the rest of the back office, whether they act or open a
// page.
const rowStyle = css`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 6px 8px;
  border: none;
  border-radius: ${bo.borderRadius};
  background: transparent;
  color: inherit;
  text-align: start;
  cursor: pointer;

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.grey200};
    color: inherit;
  }
`;

const ButtonRow = styled.button`
  ${rowStyle}
`;

const LinkRow = typedStyled(Link)`
  ${rowStyle}
`;

interface Props {
  // Left out in flyouts whose rows are words alone.
  icon?: IconNames;
  label: string;
  danger?: boolean;
  // Set for a row that opens a page rather than acting.
  link?: MenuLink;
  // Set for a row that opens choices beside the menu.
  flyoutOpened?: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}

const MenuRow = ({
  icon,
  label,
  danger = false,
  link,
  flyoutOpened,
  onClick,
  onMouseEnter,
  onKeyDown,
}: Props) => {
  const hasFlyout = flyoutOpened !== undefined;

  const content: ReactNode = (
    <>
      {icon && (
        <Icon
          name={icon}
          width="15px"
          height="15px"
          fill={danger ? colors.red600 : colors.coolGrey600}
        />
      )}
      <Box flex="1">
        <Text
          as="span"
          m="0"
          variant="boControl"
          color={danger ? 'red600' : undefined}
        >
          {label}
        </Text>
      </Box>
      {hasFlyout && (
        <Icon
          name="chevron-left"
          width="14px"
          height="14px"
          fill={colors.coolGrey500}
        />
      )}
    </>
  );

  if (link) {
    return (
      <LinkRow
        to={link.to}
        params={link.params}
        search={link.search}
        role="menuitem"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onKeyDown={onKeyDown}
      >
        {content}
      </LinkRow>
    );
  }

  return (
    <ButtonRow
      type="button"
      role="menuitem"
      aria-haspopup={hasFlyout ? 'true' : undefined}
      aria-expanded={flyoutOpened}
      className={flyoutOpened ? 'selected' : undefined}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onKeyDown={onKeyDown}
    >
      {content}
    </ButtonRow>
  );
};

export default MenuRow;
