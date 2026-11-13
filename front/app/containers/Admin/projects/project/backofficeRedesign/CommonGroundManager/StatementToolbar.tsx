import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';

import FilterMenu from '../InputManager/FilterMenu';
import { FilterCategory } from '../InputManager/FilterMenu/useFilterCategories';
import SearchToggle from '../InputManager/SearchToggle';

import messages from './messages';
import StatementBatchBar from './StatementBatchBar';

interface Props {
  selectedIdeas: IIdeaData[];
  listedTotal: number | undefined;
  onEdit: (ideaId: string) => void;
  onClearSelection: () => void;
  onDeleted: () => void;
  onSelectAll: () => void;
  isSelectingAll: boolean;
  selectAllFailed: boolean;
  search: string | undefined;
  onSearch: (term: string | null) => void;
  agreementCategory: FilterCategory;
  onClearFilters: () => void;
}

const StatementToolbar = ({
  selectedIdeas,
  listedTotal,
  onEdit,
  onClearSelection,
  onDeleted,
  onSelectAll,
  isSelectingAll,
  selectAllFailed,
  search,
  onSearch,
  agreementCategory,
  onClearFilters,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="12px"
      minHeight="40px"
      mb="12px"
    >
      {selectedIdeas.length > 0 ? (
        <StatementBatchBar
          ideas={selectedIdeas}
          total={listedTotal}
          onEdit={onEdit}
          onClear={onClearSelection}
          onDeleted={onDeleted}
          onSelectAll={onSelectAll}
          isSelectingAll={isSelectingAll}
          selectAllFailed={selectAllFailed}
        />
      ) : (
        <Text variant="boLabel" m="0">
          {listedTotal !== undefined &&
            formatMessage(messages.statementCount, { count: listedTotal })}
        </Text>
      )}
      <Box display="flex" alignItems="center" gap="8px">
        <SearchToggle
          label={formatMessage(messages.searchStatements)}
          searchTerm={search}
          onChange={onSearch}
          resultCount={listedTotal ?? 0}
        />
        <FilterMenu
          categories={[agreementCategory]}
          onClearAll={onClearFilters}
        />
      </Box>
    </Box>
  );
};

export default StatementToolbar;
