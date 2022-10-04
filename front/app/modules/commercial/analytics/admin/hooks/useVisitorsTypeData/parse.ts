import { Response, PieRow } from './typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Translations } from './utils';

// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

// utils
import { roundPercentage} from 'utils/math';

export const parsePieData = (
  data: Response['data'],
  translations: Translations
): PieRow[] | null => {
  if (data.length === 0) return null;
  const total = data.map((row) => row.count).reduce((acc, row) => row + acc, 0)
  return data.map((row, i) => ({
    name: row.returning_visitor
      ? translations.returningVisitors
      : translations.newVisitors,
    value: row.count,
    color: categoricalColorScheme({ rowIndex: i }),
    percentage: roundPercentage(row.count, total)
  }))
};

export const parseExcelData = (
  pieData: PieRow[] | null,
  translations: Translations
): XlsxData | null => {
  if (pieData === null) return null;

  const visitorsLanguageData = pieData.map((row) => ({
    [translations.type]: row.name,
    [translations.count]: row.value,
  }));

  const xlsxData = {
    [translations.title]: visitorsLanguageData,
  };

  return xlsxData;
};
