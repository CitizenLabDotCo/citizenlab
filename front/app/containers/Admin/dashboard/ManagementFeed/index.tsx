import React from 'react';

import {
  Title,
  Table,
  Thead,
  Th,
  Tr,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ManagementFeed = () => {
  const { formatMessage } = useIntl();
  return (
    <>
      <Title color="primary">{formatMessage(messages.title)}</Title>
      <Table
        bgColor={colors.white}
        innerBorders={{
          headerCells: true,
          bodyRows: true,
        }}
      >
        <Thead>
          <Tr>
            <Th>{formatMessage(messages.date)}</Th>
            <Th>{formatMessage(messages.user)}</Th>
            <Th>{formatMessage(messages.item)}</Th>
            <Th>{formatMessage(messages.action)}</Th>
          </Tr>
        </Thead>
        {/* <Tr>
            <Td>{formatMessage(messages.tableRowTitle)}</Td>
            <Td>{formatMessage(messages.tableRowStatus)}</Td>
            <Td>{formatMessage(messages.tableRowDate)}</Td>
            </Tr> */}
      </Table>
    </>
  );
};

export default ManagementFeed;
