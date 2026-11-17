import React from 'react';

import { CheckboxContext, Column } from 'react-aria-components';

import Checkbox from 'design-system/Checkbox';
import Pagination from 'design-system/Pagination';
import Table, {
  ColumnHeader,
  TableBody,
  TableHeader,
} from 'design-system/Table';
import 'design-system/tokens.css';

import { CommonGroundResultItem } from 'api/common_ground/types';
import { IIdeaData } from 'api/ideas/types';

import postManagerMessages from 'components/admin/PostManager/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './CommonGroundManager.module.css';
import messages from './messages';
import StatementRow from './StatementRow';

const COLUMN_WIDTH = 120;

interface Props {
  ideas: IIdeaData[];
  showModeration: boolean;
  resultsById: Map<string, CommonGroundResultItem>;
  selectedIds: Set<string>;
  openId: string | null;
  dimmed: boolean;
  currentPage: number;
  lastPage: number;
  onToggleSelect: (idea: IIdeaData) => void;
  onToggleSelectPage: () => void;
  onOpen: (ideaId: string) => void;
  onChangePage: (page: number) => void;
}

const StatementTable = ({
  ideas,
  showModeration,
  resultsById,
  selectedIds,
  openId,
  dimmed,
  currentPage,
  lastPage,
  onToggleSelect,
  onToggleSelectPage,
  onOpen,
  onChangePage,
}: Props) => {
  const { formatMessage } = useIntl();
  const selectedOnPage = ideas.filter((idea) => selectedIds.has(idea.id));
  const allSelected = selectedOnPage.length === ideas.length;

  const column = (id: string, label: string) => (
    <ColumnHeader id={id} defaultWidth={COLUMN_WIDTH} showChevron={false}>
      {label}
    </ColumnHeader>
  );

  return (
    <div className={dimmed ? styles.dimmed : undefined}>
      <Table
        aria-label={formatMessage(messages.statements)}
        keyboardNavigationBehavior="tab"
      >
        <TableHeader>
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
                isIndeterminate={!allSelected && selectedOnPage.length > 0}
                onChange={onToggleSelectPage}
                aria-label={formatMessage(messages.selectAllOnPage)}
              />
            </CheckboxContext.Provider>
          </Column>
          <ColumnHeader
            id="title"
            isRowHeader
            defaultWidth="1fr"
            minWidth={200}
            showChevron={false}
          >
            {formatMessage(messages.statementColumn)}
          </ColumnHeader>
          {showModeration &&
            column('assignee', formatMessage(postManagerMessages.assignee))}
          {showModeration &&
            column('likes', formatMessage(postManagerMessages.likes))}
          {column('agree', formatMessage(messages.agreeColumn))}
          {column('reactions', formatMessage(messages.reactions))}
        </TableHeader>
        <TableBody>
          {ideas.map((idea) => (
            <StatementRow
              key={idea.id}
              idea={idea}
              showModeration={showModeration}
              result={resultsById.get(idea.id)}
              selected={selectedIds.has(idea.id)}
              active={idea.id === openId}
              onToggleSelect={() => onToggleSelect(idea)}
              onOpen={() => onOpen(idea.id)}
            />
          ))}
        </TableBody>
      </Table>
      {lastPage > 1 && (
        <div className={styles.pagination}>
          <Pagination
            page={currentPage}
            pageCount={lastPage}
            onChange={onChangePage}
          />
        </div>
      )}
    </div>
  );
};

export default StatementTable;
