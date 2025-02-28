import React from 'react';

import { Thead, Tr, Th, colors, Icon } from '@citizenlab/cl2-component-library';

import { useRansackParam, setRansackParam } from '../utils';

const SORT_DIRECTIONS = {
  asc: 'ascending',
  desc: 'descending',
} as const;

const TableHead = () => {
  const startAtSort = useRansackParam('q[s][start_at]');

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
              'q[s][start_at]',
              startAtSort === 'asc' ? 'desc' : 'asc'
            );
          }}
          style={{ whiteSpace: 'nowrap' }}
        >
          Duration
        </Th>
        <Th>Project</Th>
        <Th>
          <Icon
            name="users"
            height="18px"
            fill={colors.primary}
            transform="translate(-2,0)"
          />
        </Th>
        <Th>Platform</Th>
        <Th>Methods</Th>
      </Tr>
    </Thead>
  );
};

export default TableHead;
