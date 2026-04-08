import React, { useMemo } from 'react';

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

import useSpaces from 'api/spaces/useSpaces';

import { useIntl } from 'utils/cl-intl';
import { groupIncludedResources } from 'utils/cl-react-query/groupIncludedResources';
import { indexById } from 'utils/cl-react-query/indexById';

import ColHeader from '../../_shared/ColHeader';

import messages from './messages';
import Row from './Row';

const Table = () => {
  const { formatMessage } = useIntl();
  const { data: spaces } = useSpaces();

  const spaceModeratorsById = useMemo(() => {
    const moderators = groupIncludedResources(spaces?.included ?? []).user;
    return moderators ? indexById(moderators) : undefined;
  }, [spaces?.included]);

  if (!spaces) return null;

  return (
    <Box position="relative" w="100%" h="100%" minHeight="300px">
      <TableComponent
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{ bodyRows: true }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <ColHeader>{formatMessage(messages.space)}</ColHeader>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {spaces.data.map((space) => (
            <Row
              key={space.id}
              space={space}
              spaceModeratorsById={spaceModeratorsById}
            />
          ))}
        </Tbody>
      </TableComponent>
    </Box>
  );
};

export default Table;
