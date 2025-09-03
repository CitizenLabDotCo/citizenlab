import React from 'react';

import { Tr, Td, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { RepresentativenessRow } from '../../../../../hooks/parseReferenceData';
import { formatPercentage } from '../utils';

const AbsoluteValue = styled.span`
  color: ${colors.textSecondary};
  margin-left: 4px;
`;

interface Props {
  row: RepresentativenessRow;
}

const Row = ({ row }: Props) => {
  return (
    <Tr>
      <Td background={colors.grey50}>{row.name}</Td>
      <Td>
        {formatPercentage(row.actualPercentage)}
        <AbsoluteValue>
          ({row.actualNumber.toLocaleString('en-US')})
        </AbsoluteValue>
      </Td>
      <Td>
        {formatPercentage(row.referencePercentage)}
        <AbsoluteValue>
          ({row.referenceNumber.toLocaleString('en-US')})
        </AbsoluteValue>
      </Td>
    </Tr>
  );
};

export default Row;
