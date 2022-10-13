// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

// utils
import { roundPercentages } from 'utils/math';

// typings
import { Response, PieRow, TableRow } from './typings';
import { Translations } from './utils';

export const parsePieData = (
  data: Response['data'][0],
  translations: Translations
): PieRow[] | null => {
  if (data.length === 0) return null;

  const counts = data.map(({ count }) => count);
  const percentages = roundPercentages(counts);

  return data.map((row, i) => ({
    name: translations[row.first_dimension_referrer_type_name],
    value: row.count,
    percentage: percentages[i],
    color: categoricalColorScheme({ rowIndex: i }),
  }));
};

export const parseTableData = (
  data: Response['data'][1],
  _: Translations
): TableRow[] | null => {
  if (data.length === 0) return null;

  return data.map((row) => ({
    visits: row.count,
    visitors: row.count_visitor_id,
    referrerType: row['dimension_referrer_type.name'],
    referrerName: row.referrer_name ?? '',
  }));
};

export const parseExcelData = (
  pieData: PieRow[] | null,
  translations: Translations
) => {
  if (pieData === null) return null;

  const trafficSourceData = pieData.map((row) => ({
    [translations.trafficSource]: row.name,
    [translations.numberOfVisits]: row.value,
    [translations.percentageOfVisits]: row.percentage,
  }));

  const xlsxData = {
    [translations.trafficSources]: trafficSourceData,
  };

  return xlsxData;
};
