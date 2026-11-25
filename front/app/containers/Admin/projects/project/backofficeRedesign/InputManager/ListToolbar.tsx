import React, { ReactNode } from 'react';

import ActionStatus from 'design-system/ActionStatus';
import Text from 'design-system/Text';

import { IIdeaData } from 'api/ideas/types';

import { ManagerType } from 'components/admin/PostManager';

import { useIntl } from 'utils/cl-intl';

import BatchBar from './BatchBar';
import { BatchAttribute } from './BatchBar/useBatchActions';
import useBatchFeedback from './BatchBar/useBatchFeedback';
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
  onClearSelection: () => void;
  onDeleted: (ideaIds: string[]) => void;
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
  onClearSelection,
  onDeleted,
  selectAllFailed,
  searchTerm,
  onSearch,
  categories,
  onClearFilters,
}: Props) => {
  const { formatMessage } = useIntl();
  const { terms, termCount } = useInputTermLabels();
  const { feedback, setFeedback, dismiss } = useBatchFeedback();

  return (
    <div className={styles.toolbar}>
      {feedback ? (
        <ActionStatus
          state={feedback.state}
          message={feedback.message}
          onDismiss={dismiss}
        />
      ) : selectedIdeas.length > 0 ? (
        <BatchBar
          type={type}
          projectId={projectId}
          ideas={selectedIdeas}
          onUpdated={onUpdated}
          onFeedback={setFeedback}
          onClear={onClearSelection}
          onDeleted={onDeleted}
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
