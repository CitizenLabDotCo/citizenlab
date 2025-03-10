import React from 'react';

import { Thead, Tr, Th, colors, Icon } from '@citizenlab/cl2-component-library';

import { SortType } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';

import { useRansackParam, setRansackParam } from '../utils';

import messages from './messages';

const SORT_DIRECTIONS: Record<SortType, 'ascending' | 'descending'> = {
  'start_at asc': 'ascending',
  'start_at desc': 'descending',
  'participants asc': 'ascending',
  'participants desc': 'descending',
} as const;

const getSortBehavior = (sort?: SortType) => {
  const startAtSort = sort?.startsWith('start_at')
    ? SORT_DIRECTIONS[sort]
    : undefined;
  const participantsSort = sort?.startsWith('participants')
    ? SORT_DIRECTIONS[sort]
    : undefined;

  return { startAtSort, participantsSort };
};

const TableHead = () => {
  const { formatMessage } = useIntl();
  const sort = useRansackParam('q[s]');

  const { startAtSort, participantsSort } = getSortBehavior(sort);

  return (
    <Thead>
      <Tr background={colors.grey50}>
        <Th
          clickable
          sortDirection={startAtSort}
          background={startAtSort ? colors.grey200 : undefined}
          onClick={() => {
            setRansackParam(
              'q[s]',
              startAtSort === 'descending' ? 'start_at asc' : 'start_at desc'
            );
          }}
          style={{ whiteSpace: 'nowrap' }}
        >
          {formatMessage(messages.duration)}
        </Th>
        <Th>{formatMessage(messages.project)}</Th>
        <Th
          clickable
          sortDirection={participantsSort}
          background={participantsSort ? colors.grey200 : undefined}
          onClick={() => {
            setRansackParam(
              'q[s]',
              participantsSort === 'descending'
                ? 'participants asc'
                : 'participants desc'
            );
          }}
        >
          <Icon
            name="users"
            height="18px"
            fill={colors.primary}
            transform="translate(-2,0)"
          />
        </Th>
        <Th>{formatMessage(messages.platform)}</Th>
        <Th>{formatMessage(messages.methods)}</Th>
      </Tr>
    </Thead>
  );
};

export default TableHead;
