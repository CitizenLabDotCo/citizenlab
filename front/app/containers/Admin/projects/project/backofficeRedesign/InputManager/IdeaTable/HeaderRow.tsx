import React from 'react';

import { ColumnHeader, TableHeader } from 'design-system/Table';

import { ideaSortValues, Sort } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';
import { getSortDirection } from 'utils/paginationUtils';

import { ColumnKey, COLUMNS } from '../columns';
import messages from '../messages';
import useInputTermLabels from '../useInputTermLabels';

import ColumnsMenu from './ColumnsMenu';

interface Props {
  columns: ColumnKey[];
  availableColumns: ColumnKey[];
  onChangeColumns: (columns: ColumnKey[]) => void;
  sort: Sort;
  onSort: (sort: Sort) => void;
}

// The library's list widths; the others fit their longest values.
const COLUMN_WIDTHS: Partial<Record<ColumnKey, number>> = {
  status: 160,
  assignee: 88,
  tags: 168,
  likes: 56,
  published: 112,
  totalVotes: 200,
  totalPicks: 200,
  votes: 80,
  offlineVotes: 80,
  picks: 80,
  offlinePicks: 80,
  comments: 112,
};
const COLUMN_WIDTH = 120;

const HeaderRow = ({
  columns,
  availableColumns,
  onChangeColumns,
  sort,
  onSort,
}: Props) => {
  const { formatMessage } = useIntl();
  const { capitalizedTerm } = useInputTermLabels();
  const sortedAttribute = sort.replace(/^-/, '');

  const sortDirectionOf = (attribute: Sort) =>
    sortedAttribute === attribute ? getSortDirection(sort) : undefined;

  // A descending order is the plain attribute, an ascending one its "-" form.
  const sortAction = (attribute: Sort, label: string) => ({
    label: formatMessage(messages.orderByColumn, { column: label }),
    onPress: () => {
      const ascending = ideaSortValues.find(
        (value) => value === `-${attribute}`
      );
      onSort(sort === attribute && ascending ? ascending : attribute);
    },
  });

  return (
    <TableHeader
      addColumn={
        <ColumnsMenu
          columns={columns}
          availableColumns={availableColumns}
          onChange={onChangeColumns}
        />
      }
    >
      <ColumnHeader
        id="title"
        isRowHeader
        defaultWidth="1fr"
        // Leaves room for the default proposals columns in the 764 px list.
        minWidth={160}
        sortDirection={sortDirectionOf('title')}
        showChevron={false}
        sortAction={sortAction('title', capitalizedTerm)}
      >
        {capitalizedTerm}
      </ColumnHeader>
      {columns
        .filter((column) => !COLUMNS[column].mark)
        .map((column) => {
          const { label, sort: columnSort } = COLUMNS[column];
          const columnLabel = formatMessage(label);

          return (
            <ColumnHeader
              key={column}
              id={column}
              defaultWidth={COLUMN_WIDTHS[column] ?? COLUMN_WIDTH}
              showChevron={false}
              sortDirection={columnSort && sortDirectionOf(columnSort)}
              sortAction={columnSort && sortAction(columnSort, columnLabel)}
            >
              {columnLabel}
            </ColumnHeader>
          );
        })}
    </TableHeader>
  );
};

export default HeaderRow;
