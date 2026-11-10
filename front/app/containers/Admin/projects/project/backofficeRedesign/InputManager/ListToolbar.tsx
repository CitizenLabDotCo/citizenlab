import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';

import { ManagerType } from 'components/admin/PostManager';

import { useIntl } from 'utils/cl-intl';

import BatchBar from './BatchBar';
import FilterMenu from './FilterMenu';
import { FilterCategory } from './FilterMenu/useFilterCategories';
import messages from './messages';
import SearchToggle from './SearchToggle';
import useInputTermLabels from './useInputTermLabels';

interface Props {
  type: ManagerType;
  projectId: string;
  count: number | undefined;
  selectedIdeas: IIdeaData[];
  onUpdated: (idea: IIdeaData) => void;
  onEdit: (ideaId: string) => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  isSelectingAll: boolean;
  selectAllFailed: boolean;
  searchTerm: string | undefined;
  onSearch: (term: string | null) => void;
  categories: FilterCategory[];
  onClearFilters: () => void;
}

const ListToolbar = ({
  type,
  projectId,
  count,
  selectedIdeas,
  onUpdated,
  onEdit,
  onClearSelection,
  onSelectAll,
  isSelectingAll,
  selectAllFailed,
  searchTerm,
  onSearch,
  categories,
  onClearFilters,
}: Props) => {
  const { formatMessage } = useIntl();
  const { terms, termCount } = useInputTermLabels();

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
        <BatchBar
          type={type}
          projectId={projectId}
          ideas={selectedIdeas}
          total={count}
          onUpdated={onUpdated}
          onEdit={onEdit}
          onClear={onClearSelection}
          onSelectAll={onSelectAll}
          isSelectingAll={isSelectingAll}
          selectAllFailed={selectAllFailed}
        />
      ) : (
        <Text variant="boLabel" m="0">
          {count !== undefined && termCount(count)}
        </Text>
      )}
      <Box display="flex" alignItems="center" gap="8px">
        <SearchToggle
          label={formatMessage(messages.searchTerms, { terms })}
          searchTerm={searchTerm}
          onChange={onSearch}
          resultCount={count ?? 0}
        />
        <FilterMenu categories={categories} onClearAll={onClearFilters} />
      </Box>
    </Box>
  );
};

export default ListToolbar;
