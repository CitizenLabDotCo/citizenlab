import React from 'react';

import { Thead, Tr, Th, colors, Icon } from '@citizenlab/cl2-component-library';

const TableHead = () => {
  return (
    <Thead>
      <Tr background={colors.grey50}>
        <Th>Duration</Th>
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
