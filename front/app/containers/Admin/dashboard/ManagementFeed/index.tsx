import React, { useState } from 'react';

import {
  Title,
  Table,
  Thead,
  Th,
  Tr,
  colors,
  Tbody,
  Tfoot,
  Td,
  Box,
  Spinner,
} from '@citizenlab/cl2-component-library';

import useManagementFeed from 'api/management_feed/useManagementFeed';

import Pagination from 'components/Pagination';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import ManagementFeedRow from './ManagementFeedRow';
import messages from './messages';

const ManagementFeed = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const { formatMessage } = useIntl();
  const { data: managementFeed, isLoading } = useManagementFeed({
    pageNumber,
  });

  if (!managementFeed) {
    return <Spinner />;
  }

  const currentPage = getPageNumberFromUrl(managementFeed.links.self);
  const lastPage = getPageNumberFromUrl(managementFeed.links.last);
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
        <Tbody>
          {managementFeed?.data.map((item) => (
            <ManagementFeedRow key={item.id} item={item} />
          ))}
        </Tbody>
        {currentPage && lastPage && lastPage > 1 && (
          <Tfoot>
            <Tr background={colors.grey50}>
              <Td colSpan={4}>
                <Box display="flex" justifyContent="center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={lastPage}
                    loadPage={setPageNumber}
                  />
                </Box>
              </Td>
            </Tr>
          </Tfoot>
        )}
      </Table>
    </>
  );
};

export default ManagementFeed;
