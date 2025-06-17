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
  Spinner,
} from '@citizenlab/cl2-component-library';

import useProjectFoldersAdmin from 'api/project_folders_mini/useProjectFoldersAdmin';

import { PaginationWithoutPositioning } from 'components/Pagination';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from './messages';
import Row from './Row';

const Table = () => {
  const { formatMessage } = useIntl();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: folders, isFetching } = useProjectFoldersAdmin({});

  const lastPageLink = folders?.links?.last;
  const lastPage = lastPageLink ? getPageNumberFromUrl(lastPageLink) ?? 1 : 1;

  return (
    <Box position="relative" w="100%" h="100%">
      <TableComponent
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{
          bodyRows: true,
        }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <Th py="16px">{formatMessage(messages.folder)}</Th>
            <Th py="16px">{formatMessage(messages.managers)}</Th>
            <Th py="16px">{formatMessage(messages.status)}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {folders?.data.map((folder) => (
            <Row folder={folder} key={folder.id} />
          ))}
        </Tbody>
      </TableComponent>
      {lastPage > 1 && (
        <Box mt="12px">
          <PaginationWithoutPositioning
            currentPage={currentPage}
            totalPages={lastPage}
            loadPage={setCurrentPage}
          />
        </Box>
      )}
      {isFetching && (
        <Box
          position="absolute"
          w="100%"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgColor="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          opacity={0.7}
        >
          <Spinner />
        </Box>
      )}
    </Box>
  );
};

export default Table;
