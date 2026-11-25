import React from 'react';

import Pagination from 'design-system/Pagination';
import Table, { TableBody } from 'design-system/Table';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData, Sort } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';

import { ColumnKey } from '../columns';
import headerSelectionHandler from '../headerSelection';
import messages from '../messages';
import useInputTermLabels from '../useInputTermLabels';

import HeaderRow from './HeaderRow';
import IdeaRow from './IdeaRow';
import styles from './IdeaTable.module.css';
import 'design-system/tokens.css';

interface Props {
  ideas: IIdeaData[];
  columns: ColumnKey[];
  availableColumns: ColumnKey[];
  onChangeColumns: (columns: ColumnKey[]) => void;
  sort: Sort;
  showVoteThumbnails: boolean;
  leadingVoteCount?: number;
  onSort: (sort: Sort) => void;
  statuses: IIdeaStatusData[];
  tagLabels: Map<string, string>;
  selectedIds: Set<string>;
  onSelectOnPage: (ideaIds: Set<string>) => void;
  /** How many inputs match the current filters, on every page. */
  total: number | undefined;
  onSelectAll: () => void;
  onClearSelection: () => void;
  openIdeaId: string | undefined;
  onOpen: (ideaId: string) => void;
  currentPage: number;
  lastPage: number;
  onChangePage: (page: number) => void;
}

const IdeaTable = ({
  ideas,
  columns,
  availableColumns,
  onChangeColumns,
  sort,
  showVoteThumbnails,
  leadingVoteCount,
  onSort,
  statuses,
  tagLabels,
  selectedIds,
  onSelectOnPage,
  total,
  onSelectAll,
  onClearSelection,
  openIdeaId,
  onOpen,
  currentPage,
  lastPage,
  onChangePage,
}: Props) => {
  const { formatMessage } = useIntl();
  const { capitalizedTerms, term, termCount } = useInputTermLabels();
  const pageIds = ideas.map((idea) => idea.id);
  const handleSelection = headerSelectionHandler({
    pageIds,
    selectedIds,
    onSelectOnPage,
    onSelectAll,
    onClearSelection,
  });

  return (
    <div>
      <Table
        aria-label={capitalizedTerms}
        keyboardNavigationBehavior="tab"
        selection={{
          selectedKeys: pageIds.filter((id) => selectedIds.has(id)),
          onSelectionChange: handleSelection,
          selectAll: formatMessage(messages.selectAllTerms, {
            termCount: termCount(total ?? ideas.length),
          }),
          selectRow: formatMessage(messages.selectTerm, { term }),
        }}
      >
        <HeaderRow
          columns={columns}
          availableColumns={availableColumns}
          onChangeColumns={onChangeColumns}
          sort={sort}
          onSort={onSort}
        />
        <TableBody>
          {ideas.map((idea) => (
            <IdeaRow
              key={idea.id}
              idea={idea}
              columns={columns}
              statuses={statuses}
              showVoteThumbnail={showVoteThumbnails}
              leadingVoteCount={leadingVoteCount}
              tagLabels={tagLabels}
              active={idea.id === openIdeaId}
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

export default IdeaTable;
