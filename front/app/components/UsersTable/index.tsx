import React, { useState } from 'react';

import {
  Box,
  Table as TableComponent,
  Thead,
  Tr,
  Th,
  Tbody,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

import useBilledSeats from 'api/users/useBilledSeats';

import { TSeatType } from 'components/admin/SeatBasedBilling/SeatInfo';
import Pagination from 'components/Pagination';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from './messages';
import Row from './Row';

interface Props {
  seatType: TSeatType;
}

const HeaderCel = ({ message }: { message: MessageDescriptor }) => (
  <Th py="16px">
    <Text m="0" fontSize="s" fontWeight="bold">
      <FormattedMessage {...message} />
    </Text>
  </Th>
);

const Table = ({ seatType }: Props) => {
  const [pageNumber, setPageNumber] = useState(1);

  const { data: billedUsers } = useBilledSeats({
    seatType,
    'page[number]': pageNumber,
  });

  if (!billedUsers || billedUsers.data.length === 0) {
    return null;
  }

  const lastPage = getPageNumberFromUrl(billedUsers.links.last);

  return (
    <Box mb="40px">
      <TableComponent
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{ bodyRows: true }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <HeaderCel message={messages.name} />
            <HeaderCel message={messages.role} />
            <HeaderCel message={messages.inviteStatus} />
            <HeaderCel message={messages.options} />
          </Tr>
        </Thead>
        <Tbody>
          {billedUsers.data.map((user) => (
            <Row key={user.id} user={user} />
          ))}
        </Tbody>
      </TableComponent>
      <Box mt="12px" display="flex" justifyContent="flex-start">
        <Pagination
          currentPage={pageNumber}
          totalPages={lastPage ?? 1}
          loadPage={setPageNumber}
        />
      </Box>
    </Box>
  );
};

export default Table;
