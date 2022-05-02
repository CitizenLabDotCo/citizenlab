import React from 'react';

// components
import { Table } from 'semantic-ui-react';

// typings
import { RepresentativenessRow } from '..';

interface Props {
  row: RepresentativenessRow;
}

const Row = ({ row }: Props) => {
  return (
    <Table.Row>
      <Table.Cell>{row.name}</Table.Cell>
      <Table.Cell>
        {row.actualPercentage} ({row.actualNumber})
      </Table.Cell>
      <Table.Cell>
        {row.referencePercentage} ({row.referenceNumber})
      </Table.Cell>
    </Table.Row>
  );
};

export default Row;
