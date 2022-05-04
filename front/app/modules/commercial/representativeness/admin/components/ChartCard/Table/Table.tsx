import React from 'react';
import styled from 'styled-components';

// components
import { Table } from 'semantic-ui-react';
import HeaderRow from './HeaderRow';
import Row from './Row';

// styling
import { colors } from 'utils/styleUtils';

// typings
import { RepresentativenessData } from '..';

const TABLE_HEADER_BG_COLOR = '#f9fafb';

const StyledTable = styled(Table)`
  td,
  th > div {
    color: ${colors.adminTextColor};
  }
`;

const StyledBody = styled(Table.Body)`
  td:first-child {
    background-color: ${TABLE_HEADER_BG_COLOR};
  }
`;

interface Props {
  columns: string[];
  data: RepresentativenessData;
}

const TableComponent = ({ columns, data }: Props) => (
  <StyledTable>
    <HeaderRow columns={columns} />
    <StyledBody>
      {data.map((row, i) => (
        <Row row={row} key={i} />
      ))}
    </StyledBody>
  </StyledTable>
);

export default TableComponent;
