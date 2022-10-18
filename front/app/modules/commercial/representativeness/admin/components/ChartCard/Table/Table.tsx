import React from 'react';

// components
import { Table, Tbody } from '@citizenlab/cl2-component-library';
import HeaderRow from './HeaderRow';
import Row from './Row';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

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
      bodyRows: true,
    }}
  >
    <HeaderRow columns={columns} />
    <Tbody>
      {data.map((row, i) => (
        <Row row={row} key={i} />
      ))}
    </Tbody>
  </Table>
);

export default TableComponent;
