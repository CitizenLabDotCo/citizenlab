import React from 'react';

import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import messages from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/messages';
import { TranslatedReferrers } from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes/parse';

import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  tableData: TranslatedReferrers;
}

const TableView = ({ tableData }: Props) => {
  return (
    <Box>
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
          {tableData.slice(0, 5).map((row, i) => (
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
