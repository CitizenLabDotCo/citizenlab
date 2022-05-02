import React from 'react';

// components
import { Table } from 'semantic-ui-react';
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  columns: string[];
}

const HeaderRow = ({ columns }: Props) => (
  <Table.Header>
    <Table.Row>
      {columns.map((column) => (
        <Table.HeaderCell width={1}>
          <Box my="8px">{column}</Box>
        </Table.HeaderCell>
      ))}
    </Table.Row>
  </Table.Header>
);

export default HeaderRow;
