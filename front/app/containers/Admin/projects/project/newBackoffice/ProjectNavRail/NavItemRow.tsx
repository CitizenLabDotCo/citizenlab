import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { useLocation } from 'utils/router';

import type { LinkProps } from '@tanstack/react-router';

export interface NavItem {
  name: string;
  label: MessageDescriptor;
  url: string;
  match: string;
  badge?: React.ReactNode;
}

const RowLink = typedStyled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-grow: 1;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: background 80ms ease-out;

  &:hover {
    background: ${colors.grey100};
  }

  &.active,
  &.active:hover {
    background: ${colors.grey200};
  }
`;

const NavItemRow = ({
  item,
  trailing,
}: {
  item: NavItem;
  trailing?: React.ReactNode;
}) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const active = pathname.includes(item.match);

  return (
    <Box display="flex" alignItems="center" gap="6px">
      <RowLink
        to={item.url as LinkProps['to']}
        className={active ? 'active' : undefined}
        data-cy={`e2e-new-project-nav-${item.name}`}
      >
        <Box flexGrow={1} minWidth="0">
          <Text
            m="0"
            fontSize="s"
            color={active ? 'primary' : 'coolGrey700'}
            fontWeight={active ? 'semi-bold' : 'normal'}
          >
            {formatMessage(item.label)}
          </Text>
        </Box>
        {item.badge}
      </RowLink>
      {trailing}
    </Box>
  );
};

export default NavItemRow;
