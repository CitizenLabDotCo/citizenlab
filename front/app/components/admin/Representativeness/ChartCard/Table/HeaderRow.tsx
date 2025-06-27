import React from 'react';

import { Thead, Tr, Th, Box, colors } from '@citizenlab/cl2-component-library';

import { roundPercentage } from 'utils/math';

interface Props {
  columns: string[];
}

const HeaderRow = ({ columns }: Props) => (
  <Thead>
    <Tr background={colors.grey50}>
      {columns.map((column, i) => (
        <Th width={`${roundPercentage(1, columns.length)}%`} key={i}>
          <Box my="6px">{column}</Box>
        </Th>
      ))}
    </Tr>
  </Thead>
);

export default HeaderRow;
