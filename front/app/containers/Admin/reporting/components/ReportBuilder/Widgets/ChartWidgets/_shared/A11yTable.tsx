import React from 'react';

import { invisibleA11yText } from 'component-library/utils/styleUtils';
import styled from 'styled-components';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  caption: string;
}
const StyledTable = styled('table')`
  ${invisibleA11yText}
`;

const A11yTable: React.FC<DataTableProps> = ({ columns, data, caption }) => {
  return (
    <StyledTable role="table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => {
              const value = row[column.key];
              const content = column.render ? column.render(value, row) : value;

              if (colIndex === 0) {
                return (
                  <th key={column.key} scope="row">
                    {content}
                  </th>
                );
              }
              return <td key={column.key}>{content}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
};

export default A11yTable;
