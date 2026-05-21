import React from 'react';

import moment from 'moment';

import { ScreenReaderOnly } from 'utils/a11y';

export type CellValue = string | number | null | undefined;

export type Row = Record<string, CellValue>;

export type ColumnType = 'date' | 'number' | 'percentage' | 'text';

export interface Column {
  key: string;
  label: string;
  type?: ColumnType;
}

interface DataTableProps<T> {
  columns: Column[];
  data: readonly T[];
  caption: string;
}

const formatCell = (value: CellValue, type?: ColumnType): string => {
  if (value == null) return '';
  if (type === 'date') return moment(value).format('MMM DD, YYYY');
  if (type === 'percentage') return `${value}%`;
  return String(value);
};

const A11yTable = <T,>({ columns, data, caption }: DataTableProps<T>) => {
  return (
    <ScreenReaderOnly>
      <table role="table">
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
          {data.map((row, rowIndex) => {
            const r = row as Row;
            return (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => {
                  const content = formatCell(r[column.key], column.type);

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
            );
          })}
        </tbody>
      </table>
    </ScreenReaderOnly>
  );
};

export default A11yTable;
