import React from 'react';

// components
import { Tr, Td } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { formatPercentage } from '../utils';

// typings
import { RepresentativenessRow } from '../../../hooks/createRefDataSubscription';

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
