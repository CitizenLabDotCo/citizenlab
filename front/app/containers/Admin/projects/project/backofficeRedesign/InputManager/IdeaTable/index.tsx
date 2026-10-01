import React from 'react';

import { Box, Table, Tbody } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData, Sort } from 'api/ideas/types';

import Pagination from 'components/Pagination';

import { ColumnKey } from '../columns';

import HeaderRow from './HeaderRow';
import IdeaRow from './IdeaRow';

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
  const selectedOnPage = ideas.filter((idea) => selectedIds.has(idea.id));

  return (
    <Box overflowX="auto">
      <Table>
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
        <Tbody>
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
        </Tbody>
      </Table>
      {lastPage > 1 && (
        <Box display="flex" justifyContent="center" py="16px">
          <Pagination
            currentPage={currentPage}
            totalPages={lastPage}
            loadPage={onChangePage}
          />
        </Box>
      )}
    </Box>
  );
};

export default IdeaTable;
