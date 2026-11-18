import React from 'react';

import { ColumnHeader, ColumnMenu, TableHeader } from 'design-system/Table';

import { ideaSortValues, Sort } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';
import { getSortDirection } from 'utils/paginationUtils';

import { ColumnKey, COLUMNS } from '../columns';
import useInputTermLabels from '../useInputTermLabels';

import ColumnsMenu from './ColumnsMenu';

interface Props {
  columns: ColumnKey[];
  availableColumns: ColumnKey[];
  onChangeColumns: (columns: ColumnKey[]) => void;
  sort: Sort;
  onSort: (sort: Sort) => void;
}

const COLUMN_TYPES: Partial<Record<ColumnKey, 'text' | 'date'>> = {
  status: 'text',
  assignee: 'text',
  published: 'date',
};

// Today's table sized these columns to their content; the widths fit their longest values.
const COLUMN_WIDTHS: Partial<Record<ColumnKey, number>> = {
  status: 160,
  tags: 200,
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
  const handleSort =
    (attribute: Sort) => (direction: 'ascending' | 'descending') => {
      const ascending = ideaSortValues.find(
        (value) => value === `-${attribute}`
      );
      onSort(direction === 'ascending' && ascending ? ascending : attribute);
    };

  const hideColumn = (column: ColumnKey) => () =>
    onChangeColumns(columns.filter((visible) => visible !== column));

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
        minWidth={200}
        sortDirection={sortDirectionOf('title')}
        menu={
          <ColumnMenu columnType="text" onSortChange={handleSort('title')} />
        }
      >
        {capitalizedTerm}
      </ColumnHeader>
      {columns
        .filter((column) => !COLUMNS[column].mark)
        .map((column) => {
          const { label, sort: columnSort } = COLUMNS[column];

          return (
            <ColumnHeader
              key={column}
              id={column}
              defaultWidth={COLUMN_WIDTHS[column] ?? COLUMN_WIDTH}
              showChevron={!!columnSort}
              sortDirection={columnSort && sortDirectionOf(columnSort)}
              menu={
                columnSort && (
                  <ColumnMenu
                    columnType={COLUMN_TYPES[column] ?? 'number'}
                    onSortChange={handleSort(columnSort)}
                    onHide={hideColumn(column)}
                  />
                )
              }
            >
              {formatMessage(label)}
            </ColumnHeader>
          );
        })}
    </TableHeader>
  );
};

export default HeaderRow;
