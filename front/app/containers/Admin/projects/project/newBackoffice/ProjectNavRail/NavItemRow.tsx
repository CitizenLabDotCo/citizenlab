import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { useLocation } from 'utils/router';

export type ProjectNavTarget =
  | '/admin/projects/$projectId/project-page'
  | '/admin/projects/$projectId/audience'
  | '/admin/projects/$projectId/messaging'
  | '/admin/projects/$projectId/events'
  | '/admin/projects/$projectId/files'
  | '/admin/projects/$projectId/general';

export interface NavItem {
  name: string;
  label: MessageDescriptor;
  to: ProjectNavTarget;
  badge?: React.ReactNode;
}

const Row = styled(Box)`
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: background 80ms ease-out;

  &:hover {
    background: ${colors.grey100};
  }

  &.active,
  &.active:hover {
    background: ${colors.grey200};
  }
`;

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
`;

const NavItemRow = ({
  item,
  projectId,
  trailing,
}: {
  item: NavItem;
  projectId: string;
  trailing?: React.ReactNode;
}) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const active = pathname.includes(item.to.replace('$projectId', projectId));

  return (
    <Row
      className={`intercom-product-tour-project-nav-item-${item.name}${
        active ? ' active' : ''
      }`}
      pr={trailing ? '8px' : '0'}
    >
      <RowLink to={item.to} params={{ projectId }}>
        <Box flexGrow={1} minWidth="0">
          <Text
            m="0"
            fontSize="s"
            color={active ? 'textPrimary' : 'coolGrey700'}
            fontWeight={active ? 'bold' : 'normal'}
          >
            {formatMessage(item.label)}
          </Text>
        </Box>
        {item.badge}
      </RowLink>
      {trailing}
    </Row>
  );
};

export default NavItemRow;
