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
  Icon,
} from '@citizenlab/cl2-component-library';

import useParticipantCounts from 'api/participant_counts/useParticipantCounts';
import useProjectsMiniAdmin from 'api/projects_mini_admin/useProjectsMiniAdmin';

import { PaginationWithoutPositioning } from 'components/Pagination';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import { useParams } from '../utils';

import { COLUMN_VISIBILITY } from './constants';
import messages from './messages';
import Row from './Row';

const Table = () => {
  const { formatMessage } = useIntl();
  const [currentPage, setCurrentPage] = useState(1);

  const { sort, ...params } = useParams();

  const { data: projects, isFetching } = useProjectsMiniAdmin({
    ...params,
    sort: sort ?? 'phase_starting_or_ending_soon',
    'page[size]': 10,
    'page[number]': currentPage,
  });

  const projectIds = projects?.data.map((project) => project.id) ?? [];
  const { data: participantsCounts } = useParticipantCounts(projectIds);

  const lastPageLink = projects?.links.last;
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
            <Th py="16px">{formatMessage(messages.project)}</Th>
            {COLUMN_VISIBILITY.participants && (
              <Th py="16px">
                <Icon
                  name="users"
                  height="16px"
                  fill={colors.primary}
                  mr="8px"
                />
              </Th>
            )}
            {COLUMN_VISIBILITY.currentPhase && (
              <Th py="16px">{formatMessage(messages.currentPhase)}</Th>
            )}
            {COLUMN_VISIBILITY.projectStart && (
              <Th py="16px">{formatMessage(messages.projectStart)}</Th>
            )}
            {COLUMN_VISIBILITY.projectEnd && (
              <Th py="16px">{formatMessage(messages.projectEnd)}</Th>
            )}
            {COLUMN_VISIBILITY.status && (
              <Th py="16px">{formatMessage(messages.status)}</Th>
            )}
            {COLUMN_VISIBILITY.visibility && (
              <Th py="16px">{formatMessage(messages.visibility)}</Th>
            )}
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {projects?.data.map((project) => (
            <Row
              key={project.id}
              project={project}
              participantsCount={
                participantsCounts?.data.attributes.participant_counts[
                  project.id
                ]
              }
            />
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
