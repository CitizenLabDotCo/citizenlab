import { DataRow } from './typings';

export const parseData = (data: DataRow[]) =>
  data.map((row) => ({
    ...row,
    remainder: row.total - row.value,
  }));
