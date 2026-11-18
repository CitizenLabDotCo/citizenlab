import React from 'react';

import Pagination from 'design-system/Pagination';
import Table, {
  ColumnHeader,
  TableBody,
  TableHeader,
} from 'design-system/Table';

import { CommonGroundResultItem } from 'api/common_ground/types';
import { IIdeaData } from 'api/ideas/types';

import postManagerMessages from 'components/admin/PostManager/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './CommonGroundManager.module.css';
import messages from './messages';
import StatementRow from './StatementRow';
import 'design-system/tokens.css';

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
  onSelectOnPage: (ideaIds: Set<string>) => void;
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
  onSelectOnPage,
  onOpen,
  onChangePage,
}: Props) => {
  const { formatMessage } = useIntl();
  const pageIds = ideas.map((idea) => idea.id);

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
        selection={{
          selectedKeys: pageIds.filter((id) => selectedIds.has(id)),
          onSelectionChange: (keys) =>
            onSelectOnPage(
              new Set(keys === 'all' ? pageIds : [...keys].map(String))
            ),
          selectAll: formatMessage(messages.selectAllOnPage),
          selectRow: formatMessage(messages.selectStatement),
        }}
      >
        <TableHeader>
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
              active={idea.id === openId}
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
