import { categoricalColorScheme } from 'components/admin/Graphs/styling';
import { XlsxData } from 'components/admin/ReportExportMenu';

import { roundPercentages } from 'utils/math';

import { Translations } from './translations';
import { PieRow } from './typings';
import { VisitorsLanguagesResponse } from 'api/graph_data_units/responseTypes/VisitorsLanguagesWidget';
import { keys } from 'utils/helperUtils';

export const parsePieData = ({
  sessions_per_locale,
}: VisitorsLanguagesResponse['data']['attributes']): PieRow[] | null => {
  const asArray = keys(sessions_per_locale).map((key) => ({
    locale: key,
    count: sessions_per_locale[key],
  }));

  const percentages = roundPercentages(asArray.map(({ count }) => count));

  return asArray.map((row, i) => ({
    name: row.locale.toUpperCase(),
    value: row.count,
    color: categoricalColorScheme({ rowIndex: i }),
    percentage: percentages[i],
  }));
};

export const parseExcelData = (
  { sessions_per_locale }: VisitorsLanguagesResponse['data']['attributes'],
  translations: Translations
): XlsxData | null => {
  const asArray = keys(sessions_per_locale).map((key) => ({
    locale: key,
    count: sessions_per_locale[key],
  }));

  if (asArray.length === 0) return null;

  const visitorsLanguageData = asArray.map((row) => ({
    [translations.language]: row.locale.toUpperCase(),
    [translations.count]: row.count,
  }));

  const xlsxData = {
    [translations.title]: visitorsLanguageData,
  };

  return xlsxData;
};
