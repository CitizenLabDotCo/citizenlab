import React from 'react';

import {
  Box,
  Checkbox,
  colors,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';

import Pagination from 'components/Pagination';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import StatementRow from './StatementRow';
import { Votes } from './utils';

interface Props {
  ideas: IIdeaData[];
  votesById: Map<string, Votes>;
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
  votesById,
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

  return (
    <Box opacity={dimmed ? 0.4 : 1} overflowX="auto">
      <Table>
        <Thead>
          <Tr background={colors.white}>
            <Th width="40px" pr="0">
              <Checkbox
                size="18px"
                checked={allSelected}
                indeterminate={!allSelected && selectedOnPage.length > 0}
                onChange={onToggleSelectPage}
                ariaLabel={formatMessage(messages.selectAllOnPage)}
              />
            </Th>
            <Th>{formatMessage(messages.statementColumn)}</Th>
            <Th>{formatMessage(messages.agreeColumn)}</Th>
            <Th>{formatMessage(messages.reactions)}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ideas.map((idea) => (
            <StatementRow
              key={idea.id}
              idea={idea}
              votes={votesById.get(idea.id)}
              selected={selectedIds.has(idea.id)}
              active={idea.id === openId}
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

export default StatementTable;
