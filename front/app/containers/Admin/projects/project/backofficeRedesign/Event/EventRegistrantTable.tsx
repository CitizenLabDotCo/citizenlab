import React from 'react';

import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  colors,
} from '@citizenlab/cl2-component-library';

import { AttendanceSort, IEventAttendances } from 'api/event_attendance/types';

import Pagination from 'components/Pagination';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

interface Props {
  attendances: IEventAttendances;
  sort: AttendanceSort;
  onSort: (sort: AttendanceSort) => void;
  page: number;
  onPageChange: (page: number) => void;
}

const EventRegistrantTable = ({
  attendances,
  sort,
  onSort,
  page,
  onPageChange,
}: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const attendees = new Map(
    attendances.included.map((user) => [user.id, user])
  );
  const lastPage = getPageNumberFromUrl(attendances.links.last) || 1;

  return (
    <Box overflowX="auto">
      <Table>
        <Thead>
          <Tr background={colors.white}>
            <Th>
              <Text variant="boLabel" as="span" color="coolGrey600" m="0">
                {formatMessage(messages.registrant)}
              </Text>
            </Th>
            <Th>
              <Text variant="boLabel" as="span" color="coolGrey600" m="0">
                {formatMessage(messages.email)}
              </Text>
            </Th>
            <Th aria-sort={sort === 'created_at' ? 'ascending' : 'descending'}>
              <Button
                buttonStyle="bo-text"
                type="button"
                padding="0"
                width="auto"
                icon={sort === 'created_at' ? 'chevron-up' : 'chevron-down'}
                iconPos="right"
                onClick={() =>
                  onSort(sort === 'created_at' ? '-created_at' : 'created_at')
                }
              >
                {formatMessage(messages.registered)}
              </Button>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {attendances.data.map((attendance) => {
            const user = attendees.get(
              attendance.relationships.attendee.data.id
            );
            return (
              <Tr
                key={attendance.id}
                dataCy={`e2e-event-registrant-${attendance.id}`}
              >
                <Td py="12px" borderBottom={`1px solid ${colors.grey200}`}>
                  <Text variant="boControl" m="0">
                    {user && getFullName(user)}
                  </Text>
                </Td>
                <Td py="12px" borderBottom={`1px solid ${colors.grey200}`}>
                  <Text variant="boControl" color="coolGrey600" m="0">
                    {user?.attributes.email}
                  </Text>
                </Td>
                <Td
                  py="12px"
                  borderBottom={`1px solid ${colors.grey200}`}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Text variant="boControl" color="coolGrey600" m="0">
                    {formatDate(attendance.attributes.created_at, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {lastPage > 1 && (
        <Box display="flex" justifyContent="center" py="16px">
          <Pagination
            currentPage={page}
            totalPages={lastPage}
            loadPage={onPageChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default EventRegistrantTable;
