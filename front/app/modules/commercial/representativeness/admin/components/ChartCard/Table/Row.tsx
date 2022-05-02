import React from 'react';

// components
import { Table } from 'semantic-ui-react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { formatPercentage } from '../utils';

// typings
import { RepresentativenessRow } from '..';

const AbsoluteValue = styled.span`
  color: ${colors.secondaryText};
  margin-left: 4px;
`;

interface Props {
  row: RepresentativenessRow;
}

const Row = ({ row }: Props) => {
  return (
    <Table.Row>
      <Table.Cell>{row.name}</Table.Cell>
      <Table.Cell>
        {formatPercentage(row.actualPercentage)}
        <AbsoluteValue>({row.actualNumber})</AbsoluteValue>
      </Table.Cell>
      <Table.Cell>
        {formatPercentage(row.referencePercentage)}
        <AbsoluteValue>({row.referenceNumber})</AbsoluteValue>
      </Table.Cell>
    </Table.Row>
  );
};

export default Row;
