import React from 'react';

import ActionStatus from 'design-system/ActionStatus';
import Text from 'design-system/Text';

import { IIdeaData } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';

import useBatchFeedback from '../InputManager/BatchBar/useBatchFeedback';
import FilterMenu from '../InputManager/FilterMenu';
import { FilterCategory } from '../InputManager/FilterMenu/useFilterCategories';
import SearchToggle from '../InputManager/SearchToggle';

import styles from './CommonGroundManager.module.css';
import messages from './messages';
import StatementBatchBar from './StatementBatchBar';
import 'design-system/tokens.css';

interface Props {
  selectedIdeas: IIdeaData[];
  listedTotal: number | undefined;
  onEdit: (ideaId: string) => void;
  onClearSelection: () => void;
  onDeleted: (ideaIds: string[]) => void;
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
        <StatementBatchBar
          ideas={selectedIdeas}
          total={listedTotal}
          onEdit={onEdit}
          onClear={onClearSelection}
          onFeedback={setFeedback}
          onDeleted={onDeleted}
          onSelectAll={onSelectAll}
          isSelectingAll={isSelectingAll}
          selectAllFailed={selectAllFailed}
        />
      ) : (
        <Text variant="title" tone="primary">
          {listedTotal !== undefined &&
            formatMessage(messages.statementCount, { count: listedTotal })}
        </Text>
      )}
      <div className={styles.display}>
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
      </div>
    </div>
  );
};

export default StatementToolbar;
