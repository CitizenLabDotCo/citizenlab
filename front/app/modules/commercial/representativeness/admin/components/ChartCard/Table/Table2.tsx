import React from 'react';
import styled from 'styled-components';

// components
import { Table, Body } from 'components/admin/Table';
import HeaderRow from './HeaderRow';
import Row from './Row';

// styling
import { colors } from 'utils/styleUtils';

// typings
import { RepresentativenessData } from '../../../hooks/createRefDataSubscription';

const StyledTable = styled(Table)<{ $hideBorderTop?: boolean }>`
  td,
  th > div {
    color: ${colors.primary};
  }
  ${({ $hideBorderTop }) =>
    $hideBorderTop ? 'border-top: 0px !important;' : ''}
`;

interface Props {
  columns: string[];
  data: RepresentativenessData;
  hideBorderTop?: boolean;
}

const TableComponent = ({ columns, data, hideBorderTop }: Props) => (
  <StyledTable $hideBorderTop={hideBorderTop}>
    <HeaderRow columns={columns} />
    <Body>
      {data.map((row, i) => (
        <Row row={row} key={i} />
      ))}
    </Body>
  </StyledTable>
);

export default TableComponent;
