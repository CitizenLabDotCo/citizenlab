import { Response, PieRow } from './typings';
import { XlsxData } from 'components/admin/ReportExportMenu';

// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

export const parsePieData = (data: Response['data']): PieRow[] =>
  data.map((row, i) => ({
    name: row.first_dimension_locales_name,
    value: row.count,
    color: categoricalColorScheme({ rowIndex: i }),
  }));

export const parseXlsxData = (data: Response['data']): XlsxData => ({
  sheet: data,
});
