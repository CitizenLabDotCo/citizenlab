import React from 'react';

// components
import { Thead, Tr, Th } from 'components/admin/Table';
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// utils
import { roundPercentage } from 'utils/math';

interface Props {
  columns: string[];
}

const HeaderRow = ({ columns }: Props) => (
  <Thead background={colors.grey50}>
    <Tr>
      {columns.map((column, i) => (
        <Th width={`${roundPercentage(1, columns.length)}%`} key={i}>
          <Box my="6px">{column}</Box>
        </Th>
      ))}
    </Tr>
  </Thead>
);

export default HeaderRow;
