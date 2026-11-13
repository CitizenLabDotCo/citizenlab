import React from 'react';

import {
  Box,
  colors,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';

import { IVolunteers, VolunteersSort } from 'api/volunteers/types';

import Pagination from 'components/Pagination';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from './messages';
import VolunteerRow from './VolunteerRow';

interface Props {
  volunteers: IVolunteers;
  causeTitles: Map<string, string>;
  sort: VolunteersSort;
  onSort: (sort: VolunteersSort) => void;
  currentPage: number;
  onChangePage: (page: number) => void;
}

const VolunteerTable = ({
  volunteers,
  causeTitles,
  sort,
  onSort,
  currentPage,
  onChangePage,
}: Props) => {
  const { formatMessage } = useIntl();
  const users = new Map(volunteers.included.map((user) => [user.id, user]));
  const lastPage = getPageNumberFromUrl(volunteers.links.last) || 1;

  return (
    <Box overflowX="auto">
      <Table>
        <Thead>
          <Tr background={colors.white}>
            <Th>{formatMessage(messages.volunteerColumn)}</Th>
            <Th>{formatMessage(messages.emailColumn)}</Th>
            <Th>{formatMessage(messages.cause)}</Th>
            <Th
              clickable
              sortDirection={sort === 'created_at' ? 'ascending' : 'descending'}
              onClick={() =>
                onSort(sort === 'created_at' ? '-created_at' : 'created_at')
              }
              style={{ whiteSpace: 'nowrap' }}
            >
              {formatMessage(messages.signedUpColumn)}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {volunteers.data.map((volunteer) => (
            <VolunteerRow
              key={volunteer.id}
              volunteer={volunteer}
              user={users.get(volunteer.relationships.user.data.id)}
              causeTitle={causeTitles.get(
                volunteer.relationships.cause.data.id
              )}
            />
          ))}
        </Tbody>
      </Table>
      {lastPage > 1 && (
        <Box display="flex" justifyContent="center" py="16px">
          <Pagination
            currentPage={currentPage}
            totalPages={lastPage}
            loadPage={onChangePage}
          />
        </Box>
      )}
    </Box>
  );
};

export default VolunteerTable;
