import { categoricalColorScheme } from 'components/admin/Graphs/styling';
import { XlsxData } from 'components/admin/ReportExportMenu';

import { roundPercentages } from 'utils/math';

import { Translations } from './translations';
import { Response, PieRow } from './typings';

export const parsePieData = (
  data: Response['data']['attributes']
): PieRow[] | null => {
  if (data.length === 0) return null;

  const percentages = roundPercentages(
    data.map(({ count_visitor_id }) => count_visitor_id)
  );

  return data.map((row, i) => ({
    name: row.first_dimension_locales_name.toUpperCase(),
    value: row.count_visitor_id,
    color: categoricalColorScheme({ rowIndex: i }),
    percentage: percentages[i],
  }));
};

export const parseExcelData = (
  data: Response['data']['attributes'],
  translations: Translations
): XlsxData | null => {
  if (data.length === 0) return null;

  const visitorsLanguageData = data.map((row) => ({
    [translations.language]: row.first_dimension_locales_name.toUpperCase(),
    [translations.count]: row.count_visitor_id,
  }));

  const xlsxData = {
    [translations.title]: visitorsLanguageData,
  };

  return xlsxData;
};
