import { Response, PieRow } from './typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Translations } from './utils';

// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

// utils
import { roundPercentage} from 'utils/math';

export const parsePieData = (data: Response['data']): PieRow[] | null => {
  if (data.length === 0) return null;
  const total = data.map((row) => row.count).reduce((acc, row) => row + acc, 0)
  return data.map((row, i) => ({
    name: row.first_dimension_locales_name,
    value: row.count,
    color: categoricalColorScheme({ rowIndex: i }),
    percentage: roundPercentage(row.count, total)
  }))
};

export const parseExcelData = (
  data: Response['data'],
  translations: Translations
): XlsxData | null => {
  if (data.length === 0) return null;

  const visitorsLanguageData = data.map((row) => ({
    [translations.language]: row.first_dimension_locales_name,
    [translations.count]: row.count,
  }));

  const xlsxData = {
    [translations.title]: visitorsLanguageData,
  };

  return xlsxData;
};
