import React from 'react';
// components
import { Table, Body } from 'components/admin/Table';
import HeaderRow from './HeaderRow2';
import Row from './Row2';

// typings
import { RepresentativenessData } from '../../../hooks/createRefDataSubscription';

interface Props {
  columns: string[];
  data: RepresentativenessData;
  hideBorderTop?: boolean;
}

const TableComponent = ({ columns, data, hideBorderTop }: Props) => (
  <Table borderTop={hideBorderTop ? 'none' : undefined}>
    <HeaderRow columns={columns} />
    <Body>
      {data.map((row, i) => (
        <Row row={row} key={i} />
      ))}
    </Body>
  </Table>
);

export default TableComponent;
