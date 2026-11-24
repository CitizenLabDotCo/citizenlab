import React, { ReactNode } from 'react';

import Text from 'design-system/Text';

import { IIdeaData } from 'api/ideas/types';

import { ManagerType } from 'components/admin/PostManager';

import { useIntl } from 'utils/cl-intl';

import BatchBar from './BatchBar';
import { BatchAttribute } from './BatchBar/useBatchActions';
import FilterMenu from './FilterMenu';
import { FilterCategory } from './FilterMenu/useFilterCategories';
import styles from './ListToolbar.module.css';
import messages from './messages';
import SearchToggle from './SearchToggle';
import useInputTermLabels from './useInputTermLabels';

interface Props {
  type: ManagerType;
  projectId: string;
  count: number | undefined;
  displayToggle?: ReactNode;
  selectedIdeas: IIdeaData[];
  onUpdated: (ideas: IIdeaData[], attribute: BatchAttribute) => void;
  onEdit: (ideaId: string) => void;
  onClearSelection: () => void;
  onDeleted: (ideaIds: string[]) => void;
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
  displayToggle,
  selectedIdeas,
  onUpdated,
  onEdit,
  onClearSelection,
  onDeleted,
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
    <div className={styles.toolbar}>
      {selectedIdeas.length > 0 ? (
        <BatchBar
          type={type}
          projectId={projectId}
          ideas={selectedIdeas}
          total={count}
          onUpdated={onUpdated}
          onEdit={onEdit}
          onClear={onClearSelection}
          onDeleted={onDeleted}
          onSelectAll={onSelectAll}
          isSelectingAll={isSelectingAll}
          selectAllFailed={selectAllFailed}
        />
      ) : (
        <Text variant="title" tone="primary">
          {count !== undefined && termCount(count)}
        </Text>
      )}
      <div className={styles.display}>
        {displayToggle}
        <SearchToggle
          label={formatMessage(messages.searchTerms, { terms })}
          searchTerm={searchTerm}
          onChange={onSearch}
          resultCount={count ?? 0}
        />
        <FilterMenu categories={categories} onClearAll={onClearFilters} />
      </div>
    </div>
  );
};

export default ListToolbar;
