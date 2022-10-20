import React, { useState } from 'react';

// hooks
import useVisitorReferrers from '../../hooks/useVisitorReferrers';

// components
import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
} from '@citizenlab/cl2-component-library';
import Pagination from 'components/Pagination';
import ReferrerListLink from './RefferListLink';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { QueryParametersWithoutPagination } from '../../hooks/useVisitorReferrers/typings';

const Percentage = ({ children }) => (
  <Text
    mb="0px"
    mt="0px"
    color="coolGrey500"
    display="inline"
    ml="4px"
    fontSize="s"
  >
    ({children}%)
  </Text>
);

interface Props extends QueryParametersWithoutPagination {
  onOpenModal?: () => void;
}

const TableComponent = ({
  projectId,
  startAtMoment,
  endAtMoment,
  onOpenModal,
}: Props) => {
  const [pageNumber, setPageNumber] = useState<number>(1);

  const { tableData } = useVisitorReferrers({
    projectId,
    startAtMoment,
    endAtMoment,
    pageSize: 10,
    pageNumber,
  });

  if (isNilOrError(tableData)) return null;

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
          {tableData.map((row, i) => (
            <Tr key={i}>
              <Td background={colors.grey50}>
                ({row.referrerType}) {row.referrer}
              </Td>
              <Td>
                {row.visits}
                <Percentage>{row.visitsPercentage}</Percentage>
              </Td>
              <Td>
                {row.visitors}
                <Percentage>{row.visitorsPercentage}</Percentage>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Box
        mt="40px"
        display="flex"
        flexDirection="row-reverse"
        justifyContent="space-between"
        alignItems="center"
      >
        <Pagination
          currentPage={pageNumber}
          totalPages={5}
          loadPage={setPageNumber}
        />

        {onOpenModal && <ReferrerListLink onOpenModal={onOpenModal} />}
      </Box>
    </Box>
  );
};

export default TableComponent;
