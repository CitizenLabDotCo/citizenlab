import React from 'react';

// components
import { Table, Body } from 'components/admin/Table';
import HeaderRow from './HeaderRow';
import Row from './Row';

// styling
import { colors, stylingConsts } from '@citizenlab/cl2-component-library';

// typings
import { RepresentativenessData } from '../../../hooks/createRefDataSubscription';

interface Props {
  columns: string[];
  data: RepresentativenessData;
  hideBorderTop?: boolean;
}

const TableComponent = ({ columns, data, hideBorderTop }: Props) => (
  <Table
    border={`1px solid ${colors.grey300}`}
    borderRadius={stylingConsts.borderRadius}
    borderTop={hideBorderTop ? 'none' : undefined}
    innerBorders={{
      bodyRows: `1px solid ${colors.grey200}`,
    }}
  >
    <HeaderRow columns={columns} />
    <Body>
      {data.map((row, i) => (
        <Row row={row} key={i} />
      ))}
    </Body>
  </Table>
);

export default TableComponent;
