// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

// utils
import { roundPercentages } from 'utils/math';

// typings
import { Response, PieRow } from './typings';
import { Translations } from './translations';

export const parsePieData = (
  data: Response['data'],
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
