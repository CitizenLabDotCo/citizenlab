import React from 'react';

import Pagination from 'design-system/Pagination';
import Table, {
  Cell,
  ColumnHeader,
  ColumnMenu,
  Row,
  TableBody,
  TableHeader,
} from 'design-system/Table';

import { AttendanceSort, IEventAttendances } from 'api/event_attendance/types';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { getFullName } from 'utils/textUtils';

import styles from './EventManager.module.css';
import messages from './messages';
import 'design-system/tokens.css';

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
  const sortDirection = sort === 'created_at' ? 'ascending' : 'descending';

  return (
    <div>
      <Table
        aria-label={formatMessage(messages.registrantCount, {
          count: attendances.meta.total,
        })}
      >
        <TableHeader>
          <ColumnHeader id="registrant" isRowHeader showChevron={false}>
            {formatMessage(messages.registrant)}
          </ColumnHeader>
          <ColumnHeader id="email" showChevron={false}>
            {formatMessage(messages.email)}
          </ColumnHeader>
          <ColumnHeader
            id="registered"
            defaultWidth={140}
            indicator={sortDirection}
            menu={
              <ColumnMenu
                columnType="date"
                sortDirection={sortDirection}
                onSortChange={(direction) =>
                  onSort(
                    direction === 'ascending' ? 'created_at' : '-created_at'
                  )
                }
              />
            }
          >
            {formatMessage(messages.registered)}
          </ColumnHeader>
        </TableHeader>
        <TableBody>
          {attendances.data.map((attendance) => {
            const user = attendees.get(
              attendance.relationships.attendee.data.id
            );
            const name = user ? getFullName(user) : undefined;

            return (
              <Row
                key={attendance.id}
                id={attendance.id}
                textValue={name}
                data-cy={`e2e-event-registrant-${attendance.id}`}
              >
                <Cell>{name}</Cell>
                <Cell tone="secondary">{user?.attributes.email}</Cell>
                <Cell tone="secondary">
                  <span className={styles.date}>
                    {formatDate(attendance.attributes.created_at, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </Cell>
              </Row>
            );
          })}
        </TableBody>
      </Table>
      {lastPage > 1 && (
        <div className={styles.pagination}>
          <Pagination
            page={page}
            pageCount={lastPage}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default EventRegistrantTable;
