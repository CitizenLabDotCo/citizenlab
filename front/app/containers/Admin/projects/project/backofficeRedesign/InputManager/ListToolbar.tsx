import React from 'react';

import { IIdeaData } from 'api/ideas/types';

import { ManagerType } from 'components/admin/PostManager';

import { useIntl } from 'utils/cl-intl';

import BatchBar from './BatchBar';
import FilterMenu from './FilterMenu';
import { FilterCategory } from './FilterMenu/useFilterCategories';
import styles from './ListToolbar.module.css';
import messages from './messages';
import SearchToggle from './SearchToggle';

interface Props {
  type: ManagerType;
  projectId: string;
  count: number | undefined;
  selectedIdeas: IIdeaData[];
  onUpdated: (idea: IIdeaData) => void;
  onEdit: (ideaId: string) => void;
  onClearSelection: () => void;
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
  searchTerm,
  onSearch,
  categories,
  onClearFilters,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.toolbar}>
      {selectedIdeas.length > 0 ? (
        <BatchBar
          type={type}
          projectId={projectId}
          ideas={selectedIdeas}
          onUpdated={onUpdated}
          onEdit={onEdit}
          onClear={onClearSelection}
        />
      ) : (
        <p className={styles.count}>
          {count !== undefined && formatMessage(messages.inputCount, { count })}
        </p>
      )}
      <div className={styles.display}>
        <SearchToggle
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
