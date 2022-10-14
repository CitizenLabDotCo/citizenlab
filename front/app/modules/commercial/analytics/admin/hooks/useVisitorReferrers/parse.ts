import { ReferrerRow, ReferrersTotalRow, TableRow } from './typings';

export const parseTableData = (
  referrerRows: ReferrerRow[],
  totals: ReferrersTotalRow
): TableRow[] => {
  console.log(totals);

  return referrerRows.map(() => ({
    visits: 0,
    visitsPercentage: 0,
    visitors: 0,
    visitorsPercentage: 0,
    referrerType: '',
    referrerName: '',
  }));
};
