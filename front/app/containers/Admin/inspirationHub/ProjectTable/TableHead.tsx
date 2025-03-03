import React from 'react';

import { Thead, Tr, Th, colors, Icon } from '@citizenlab/cl2-component-library';

import { SortType } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';

import { useRansackParam, setRansackParam } from '../utils';

import messages from './messages';

const SORT_DIRECTIONS: Record<SortType, 'ascending' | 'descending'> = {
  'start_at asc': 'ascending',
  'start_at desc': 'descending',
} as const;

const TableHead = () => {
  const { formatMessage } = useIntl();
  const startAtSort = useRansackParam('q[s]');

  return (
    <Thead>
      <Tr background={colors.grey50}>
        <Th
          clickable
          // By default, the response is sorted descendingly by the start date
          // even if no explicit sort param is supplied.
          sortDirection={
            startAtSort ? SORT_DIRECTIONS[startAtSort] : 'descending'
          }
          background={colors.grey200}
          onClick={() => {
            setRansackParam(
              'q[s]',
              startAtSort === 'start_at asc' ? 'start_at desc' : 'start_at asc'
            );
          }}
          style={{ whiteSpace: 'nowrap' }}
        >
          {formatMessage(messages.duration)}
        </Th>
        <Th>{formatMessage(messages.project)}</Th>
        <Th>
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
