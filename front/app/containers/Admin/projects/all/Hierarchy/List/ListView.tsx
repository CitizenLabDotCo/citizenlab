import React, { Fragment } from 'react';

import {
  Box,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';
import { buttonsFocusRingInset } from 'global-styles';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import LoadMore from '../Grid/LoadMore';
import { LevelGroup } from '../levelGroups';
import LevelSummary from '../LevelSummary';
import messages from '../messages';

import AddColumnsMenu from './AddColumnsMenu';
import {
  ADD_COLUMN_WIDTH,
  GRIP_COLUMN_WIDTH,
  getTableMinWidth,
  getVisibleColumns,
} from './columns';
import FolderRows from './FolderRows';
import GroupHeaderRow from './GroupHeaderRow';
import HeaderCell from './HeaderCell';
import ProjectRows from './ProjectRows';
import SpaceRows from './SpaceRows';
import useAddedColumns from './useAddedColumns';

// The header sets each column's width; the project column takes the rest.
// Its cells and scroll area clip, and its rows touch.
const FixedTable = styled(Table)`
  table-layout: fixed;
  ${buttonsFocusRingInset}
`;

// A wide table scrolls sideways here. Without the containment, its width would
// stretch the admin layout's flex columns and the whole page would scroll.
const ScrollArea = styled.div`
  width: 100%;
  overflow-x: auto;
  contain: inline-size;
`;

interface Props {
  groups: LevelGroup[];
  summary?: string;
}

// One table for the whole level: spaces and folders use the project columns,
// under a group header when the level has more than one group.
const ListView = ({ groups, summary }: Props) => {
  const { formatMessage } = useIntl();
  const { added } = useAddedColumns();
  const columns = getVisibleColumns(added);
  const showGroupHeaders = groups.length > 1;
  // With the grip's column and the one for the "+" button.
  const colSpan = columns.length + 2;

  // A folder's projects have no group label, so their count goes above,
  // unless the level gives its own.
  const [onlyGroup] = groups;
  const showCount = groups.length === 1 && !onlyGroup.label;
  const shownSummary =
    summary ??
    (showCount
      ? formatMessage(messages.projectsCount, { count: onlyGroup.count })
      : undefined);

  return (
    <Box data-cy="projects-hierarchy-list">
      {shownSummary && <LevelSummary text={shownSummary} />}
      <ScrollArea>
        <FixedTable
          w="100%"
          minWidth={`${getTableMinWidth(columns)}px`}
          innerBorders={{ bodyRows: true }}
        >
          <Thead>
            <Tr>
              <Th w={`${GRIP_COLUMN_WIDTH}px`} p="0" />
              {columns.map((column) => (
                <HeaderCell key={column} column={column} />
              ))}
              <Th w={`${ADD_COLUMN_WIDTH}px`} px="4px" py="2px">
                <AddColumnsMenu />
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {groups.map((group) => (
              <Fragment key={group.kind}>
                {showGroupHeaders && group.label && (
                  <GroupHeaderRow
                    label={group.label}
                    count={group.count}
                    colSpan={colSpan}
                  />
                )}
                {group.kind === 'spaces' && (
                  <SpaceRows
                    spaces={group.spaces}
                    columns={columns}
                    arrangeable={group.arrangeable}
                  />
                )}
                {group.kind === 'folders' && (
                  <FolderRows
                    query={group.query}
                    columns={columns}
                    arrangeable={group.arrangeable}
                  />
                )}
                {group.kind === 'projects' && (
                  <ProjectRows
                    query={group.query}
                    columns={columns}
                    pathFrom={group.pathFrom}
                    arrangeable={group.arrangeable}
                  />
                )}
              </Fragment>
            ))}
          </Tbody>
        </FixedTable>
      </ScrollArea>
      {groups.map(
        (group) =>
          group.kind !== 'spaces' && (
            <LoadMore
              key={group.kind}
              hasNextPage={group.query.hasNextPage}
              isFetchingNextPage={group.query.isFetchingNextPage}
              fetchNextPage={group.query.fetchNextPage}
            />
          )
      )}
    </Box>
  );
};

export default ListView;
