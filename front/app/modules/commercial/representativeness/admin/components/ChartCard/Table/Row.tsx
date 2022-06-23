import React from 'react';

// components
import { Table } from 'semantic-ui-react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { formatPercentage, formatThousands } from '../utils';

// typings
import { RepresentativenessRow } from '../../../hooks/useReferenceData';

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
        <AbsoluteValue>({formatThousands(row.actualNumber)})</AbsoluteValue>
      </Table.Cell>
      <Table.Cell>
        {formatPercentage(row.referencePercentage)}
        <AbsoluteValue>({formatThousands(row.referenceNumber)})</AbsoluteValue>
      </Table.Cell>
    </Table.Row>
  );
};

export default Row;
