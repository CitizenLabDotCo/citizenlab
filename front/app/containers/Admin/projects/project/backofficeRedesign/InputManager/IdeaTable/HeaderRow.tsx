import React from 'react';

import {
  Checkbox,
  colors,
  Th,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';

import { ideaSortValues, Sort } from 'api/ideas/types';

import SortableHeaderCell from 'components/admin/PostManager/components/PostTable/header/SortableHeaderCell';

import { useIntl } from 'utils/cl-intl';
import { getSortDirection } from 'utils/paginationUtils';

import { ColumnKey, COLUMNS } from '../columns';
import messages from '../messages';

import ColumnsMenu from './ColumnsMenu';

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

  // A first click orders descending, a second click on the same column flips it.
  const handleSort = (attribute: Sort) => () => {
    const isSameAttribute = sort.replace(/^-/, '') === attribute;
    const ascending = ideaSortValues.find((value) => value === `-${attribute}`);

    onSort(
      isSameAttribute && sortDirection === 'descending' && ascending
        ? ascending
        : attribute
    );
  };

  return (
    <Thead>
      <Tr background={colors.white}>
        <Th width="40px" pr="0">
          <Checkbox
            size="18px"
            checked={allSelected}
            indeterminate={!allSelected && someSelected}
            onChange={onToggleSelectAll}
            ariaLabel={formatMessage(messages.selectAll)}
          />
        </Th>
        <SortableHeaderCell
          sortAttribute={sort}
          sortAttributeName="title"
          sortDirection={sortDirection}
          onChange={handleSort('title')}
        >
          {formatMessage(messages.inputColumn)}
        </SortableHeaderCell>
        {columns
          .filter((column) => !COLUMNS[column].mark)
          .map((column) => {
            const { label, sort: columnSort } = COLUMNS[column];

            return columnSort ? (
              <SortableHeaderCell
                key={column}
                sortAttribute={sort}
                sortAttributeName={columnSort}
                sortDirection={sortDirection}
                onChange={handleSort(columnSort)}
              >
                {formatMessage(label)}
              </SortableHeaderCell>
            ) : (
              <Th key={column} style={{ whiteSpace: 'nowrap' }}>
                {formatMessage(label)}
              </Th>
            );
          })}
        <Th width="40px">
          <ColumnsMenu
            columns={columns}
            availableColumns={availableColumns}
            onChange={onChangeColumns}
          />
        </Th>
      </Tr>
    </Thead>
  );
};

export default HeaderRow;
