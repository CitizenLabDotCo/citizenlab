import { Response, PieRow } from './typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Translations } from './utils';

// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

export const parsePieData = (
  data: Response['data'],
  translations: Translations
): PieRow[] | null => {
  if (data.length === 0) return null;

  return data.map((row, i) => ({
    name: row.returning_visitor
      ? translations.returningVisitors
      : translations.newVisitors,
    value: row.count,
    color: categoricalColorScheme({ rowIndex: i }),
  }));
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
