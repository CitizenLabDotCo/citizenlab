import React from 'react';
import { VisitorsTrafficSourcesResponse } from 'api/graph_data_units/responseTypes/VisitorsTrafficSourcesWidget';

import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import messages from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  data: VisitorsTrafficSourcesResponse['data']['attributes']['top_50_referrers'];
}

const TableView = ({ data }: Props) => {
  return (
    <Box px="20px">
      <Table
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{
          bodyRows: true,
        }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <Th py="16px">
              <FormattedMessage {...messages.referrer} />
            </Th>
            <Th py="16px">
              <FormattedMessage {...messages.visits} />
            </Th>
            <Th py="16px">
              <FormattedMessage {...messages.visitors} />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, i) => (
            <Tr key={i}>
              <Td background={colors.grey50}>
                ({row.referrer_type}) {row.referrer}
              </Td>
              <Td>{row.visits}</Td>
              <Td>{row.visitors}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TableView;
