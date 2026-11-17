import React from 'react';

import Pagination from 'design-system/Pagination';
import Table, { TableBody } from 'design-system/Table';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData, Sort } from 'api/ideas/types';

import { ColumnKey } from '../columns';
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
  onSort: (sort: Sort) => void;
  statuses: IIdeaStatusData[];
  tagLabels: Map<string, string>;
  selectedIds: Set<string>;
  onToggleSelect: (idea: IIdeaData) => void;
  onToggleSelectPage: () => void;
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
  onSort,
  statuses,
  tagLabels,
  selectedIds,
  onToggleSelect,
  onToggleSelectPage,
  openIdeaId,
  onOpen,
  currentPage,
  lastPage,
  onChangePage,
}: Props) => {
  const { capitalizedTerms } = useInputTermLabels();
  const selectedOnPage = ideas.filter((idea) => selectedIds.has(idea.id));

  return (
    <div>
      <Table aria-label={capitalizedTerms} keyboardNavigationBehavior="tab">
        <HeaderRow
          columns={columns}
          availableColumns={availableColumns}
          onChangeColumns={onChangeColumns}
          sort={sort}
          onSort={onSort}
          allSelected={
            ideas.length > 0 && selectedOnPage.length === ideas.length
          }
          someSelected={selectedOnPage.length > 0}
          onToggleSelectAll={onToggleSelectPage}
        />
        <TableBody>
          {ideas.map((idea) => (
            <IdeaRow
              key={idea.id}
              idea={idea}
              columns={columns}
              statuses={statuses}
              tagLabels={tagLabels}
              selected={selectedIds.has(idea.id)}
              active={idea.id === openIdeaId}
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

export default IdeaTable;
