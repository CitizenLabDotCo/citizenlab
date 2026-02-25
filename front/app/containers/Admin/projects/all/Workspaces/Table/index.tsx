import React from 'react';

import {
  Box,
  Table as TableComponent,
  Thead,
  Tr,
  Th,
  Tbody,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import ColHeader from '../../_shared/ColHeader';

import messages from './messages';
import Row from './Row';

const Table = () => {
  const { formatMessage } = useIntl();

  const DATA = [{ name: 'Workspace 1', id: '1' }];

  return (
    <Box position="relative" w="100%" h="100%" minHeight="300px">
      <TableComponent
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{ bodyRows: true }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <ColHeader>{formatMessage(messages.workspace)}</ColHeader>
            <ColHeader>{formatMessage(messages.workspaceManagers)}</ColHeader>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {DATA.map((workspace) => (
            <Row key={workspace.id} workspace={workspace} />
          ))}
        </Tbody>
      </TableComponent>
    </Box>
  );
};

export default Table;
