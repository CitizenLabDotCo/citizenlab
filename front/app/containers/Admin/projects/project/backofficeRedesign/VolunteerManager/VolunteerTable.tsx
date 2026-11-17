import React from 'react';

import Pagination from 'design-system/Pagination';
import Table, {
  ColumnHeader,
  ColumnMenu,
  TableBody,
  TableHeader,
} from 'design-system/Table';
import 'design-system/tokens.css';

import { IVolunteers, VolunteersSort } from 'api/volunteers/types';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from './messages';
import styles from './VolunteerManager.module.css';
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
  const sortDirection = sort === 'created_at' ? 'ascending' : 'descending';

  return (
    <div>
      <Table aria-label={formatMessage(messages.volunteers)}>
        <TableHeader>
          <ColumnHeader id="volunteer" isRowHeader showChevron={false}>
            {formatMessage(messages.volunteerColumn)}
          </ColumnHeader>
          <ColumnHeader id="email" showChevron={false}>
            {formatMessage(messages.emailColumn)}
          </ColumnHeader>
          <ColumnHeader id="cause" showChevron={false}>
            {formatMessage(messages.cause)}
          </ColumnHeader>
          <ColumnHeader
            id="signedUp"
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
            {formatMessage(messages.signedUpColumn)}
          </ColumnHeader>
        </TableHeader>
        <TableBody>
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
        </TableBody>
      </Table>
      {lastPage > 1 && (
        <div className={styles.pagination}>
          <Pagination
            page={currentPage}
            pageCount={lastPage}
            onChange={onChangePage}
          />
        </div>
      )}
    </div>
  );
};

export default VolunteerTable;
