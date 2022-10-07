import React from 'react';

// components
import { Header, Row /*Cell*/ } from 'components/admin/Table';
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  columns: string[];
}

const HeaderRow = ({ columns }: Props) => (
  <Header>
    <Row>
      {columns.map((column) => (
        // <Cell width={1} key={i}>
        <Box my="6px">{column}</Box>
        // </Cell>
      ))}
    </Row>
  </Header>
);

export default HeaderRow;
