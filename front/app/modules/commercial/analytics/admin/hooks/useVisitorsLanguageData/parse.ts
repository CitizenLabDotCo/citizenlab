import { Response, PieRow } from './typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Translations } from './utils';

// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

export const parsePieData = (data: Response['data']): PieRow[] =>
  data.map((row, i) => ({
    name: row.first_dimension_locales_name,
    value: row.count,
    color: categoricalColorScheme({ rowIndex: i }),
  }));

export const parseExcelData = (
  data: Response['data'],
  translations: Translations
): XlsxData => {
  const visitorsLanguageData = data?.map((row) => ({
    [translations.language]: row.first_dimension_locales_name,
    [translations.count]: row.count,
  }));

  const xlsxData = {
    [translations.title]: visitorsLanguageData,
  };

  return xlsxData;
};
