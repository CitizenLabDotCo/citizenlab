import { Response, PieRow } from './typings';
import { colors } from 'components/admin/Graphs/styling';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Translations } from './utils';

// styling

export const parsePieData = (
  data: Response['data'],
  translations: Translations
): PieRow[] => {
  const usersByAction = data.map(
    (row) =>
      row.first_dimension_date_first_action_date ===
      row.first_dimension_date_last_action_date
  );
  const newUsers = usersByAction.filter((v) => v).length;
  const oldUsers = usersByAction.filter((v) => !v).length;
  return [
    {
      name: translations.newVisitors,
      value: newUsers,
      color: colors.categorical01,
    },
    {
      name: translations.returningVisitors,
      value: oldUsers,
      color: colors.categorical02,
    },
  ];
};

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
