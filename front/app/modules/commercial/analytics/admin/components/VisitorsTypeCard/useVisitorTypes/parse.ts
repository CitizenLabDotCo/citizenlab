import { Response, PieRow } from './typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Translations } from './translations';

import { categoricalColorScheme } from 'components/admin/Graphs/styling';

import { roundPercentages } from 'utils/math';

export const parsePieData = (
  data: Response['data']['attributes'],
  translations: Translations
): PieRow[] | null => {
  if (data.length === 0) return null;

  const percentages = roundPercentages(
    data.map(({ count_visitor_id }) => count_visitor_id)
  );

  return data.map((row, i) => ({
    name: row.returning_visitor
      ? translations.returningVisitors
      : translations.newVisitors,
    value: row.count_visitor_id,
    color: categoricalColorScheme({ rowIndex: i }),
    percentage: percentages[i],
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
