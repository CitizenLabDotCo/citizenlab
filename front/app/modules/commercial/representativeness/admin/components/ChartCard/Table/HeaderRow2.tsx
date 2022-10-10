import React from 'react';

// components
import { Header, Row, HeaderCell } from 'components/admin/Table';
import { Box } from '@citizenlab/cl2-component-library';

// utils
import { roundPercentage } from 'utils/math';

interface Props {
  columns: string[];
}

const HeaderRow = ({ columns }: Props) => (
  <Header>
    <Row>
      {columns.map((column, i) => (
        <HeaderCell
          width={`${roundPercentage(1, columns.length)}%`}
          key={i}
          p="12px"
          clickable
          onClick={(e) => {
            console.log(e);
          }}
        >
          <Box my="6px">{column}</Box>
        </HeaderCell>
      ))}
    </Row>
  </Header>
);

export default HeaderRow;
