import React from 'react';

import { CheckboxContext, Column } from 'react-aria-components';

import Checkbox from 'design-system/Checkbox';
import {
  ColumnHeader,
  ColumnIndicator,
  ColumnMenu,
  TableHeader,
} from 'design-system/Table';

import { ideaSortValues, Sort } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';
import { getSortDirection } from 'utils/paginationUtils';

import { ColumnKey, COLUMNS } from '../columns';
import messages from '../messages';

import ColumnsMenu from './ColumnsMenu';
import styles from './IdeaTable.module.css';

interface Props {
  columns: ColumnKey[];
  availableColumns: ColumnKey[];
  onChangeColumns: (columns: ColumnKey[]) => void;
  sort: Sort;
  onSort: (sort: Sort) => void;
  allSelected: boolean;
  someSelected: boolean;
  onToggleSelectAll: () => void;
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
  allSelected,
  someSelected,
  onToggleSelectAll,
}: Props) => {
  const { formatMessage } = useIntl();
  const sortDirection = getSortDirection(sort);
  const sortedAttribute = sort.replace(/^-/, '');

  const indicator = (attribute: Sort): ColumnIndicator =>
    sortedAttribute === attribute ? sortDirection : 'none';

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
      <Column
        id="select"
        width={40}
        minWidth={40}
        className={styles.selectColumn}
      >
        {/* The header row offers its checkbox slot to React Aria's own selection only. */}
        <CheckboxContext.Provider value={null}>
          <Checkbox
            isSelected={allSelected}
            isIndeterminate={!allSelected && someSelected}
            onChange={onToggleSelectAll}
            aria-label={formatMessage(messages.selectAll)}
          />
        </CheckboxContext.Provider>
      </Column>
      <ColumnHeader
        id="title"
        isRowHeader
        defaultWidth="1fr"
        minWidth={200}
        allowsResizing={false}
        indicator={indicator('title')}
        menu={
          <ColumnMenu
            columnType="text"
            sortDirection={
              sortedAttribute === 'title' ? sortDirection : undefined
            }
            onSortChange={handleSort('title')}
          />
        }
      >
        {formatMessage(messages.inputColumn)}
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
              allowsResizing={false}
              showChevron={!!columnSort}
              indicator={columnSort ? indicator(columnSort) : 'none'}
              menu={
                columnSort && (
                  <ColumnMenu
                    columnType={COLUMN_TYPES[column] ?? 'number'}
                    sortDirection={
                      sortedAttribute === columnSort ? sortDirection : undefined
                    }
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
