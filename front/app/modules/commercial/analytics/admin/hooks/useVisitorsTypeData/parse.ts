import { Response, PieRow } from './typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Translations } from './utils';

// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

export const parsePieData = (
  data: Response['data'],
  translations: Translations
): PieRow[] =>
  data.map((row, i) => ({
    name: row.returning_visitor
      ? translations.returningVisitors
      : translations.newVisitors,
    value: row.count,
    color: categoricalColorScheme({ rowIndex: i }),
  }));

export const parseExcelData = (
  data: Response['data'],
  translations: Translations
): XlsxData => {
  const visitorsLanguageData = parsePieData(data, translations).map((row) => ({
    [translations.type]: row.name,
    [translations.count]: row.value,
  }));

  const xlsxData = {
    [translations.title]: visitorsLanguageData,
  };

  return xlsxData;
};
