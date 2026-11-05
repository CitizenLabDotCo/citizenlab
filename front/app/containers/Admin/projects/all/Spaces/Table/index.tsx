import React, { useMemo } from 'react';

import {
  Box,
  Table as TableComponent,
  Text,
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
import sharedMessages from '../../_shared/messages';
import { useParams } from '../../_shared/params';

import messages from './messages';
import Row from './Row';

const Table = () => {
  const { formatMessage } = useIntl();
  const params = useParams();
  const { data: spaces } = useSpaces(params);

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
            <ColHeader>{formatMessage(sharedMessages.managers)}</ColHeader>
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
      {spaces.data.length === 0 && (
        <Box
          mt="12px"
          display="flex"
          justifyContent="center"
          color={colors.textPrimary}
        >
          <Text>{formatMessage(messages.noSpacesFound)}</Text>
        </Box>
      )}
    </Box>
  );
};

export default Table;
