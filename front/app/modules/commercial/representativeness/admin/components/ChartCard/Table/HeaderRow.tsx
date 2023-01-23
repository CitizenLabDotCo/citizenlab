import React from 'react';

// components
import { Thead, Tr, Th, Box } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// utils
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
