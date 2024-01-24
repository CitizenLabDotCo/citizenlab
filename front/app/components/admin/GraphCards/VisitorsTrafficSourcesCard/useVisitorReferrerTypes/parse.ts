// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

// utils
import { roundPercentages } from 'utils/math';

// typings
import { PieRow } from './typings';
import { Translations } from './translations';
import { VisitorsTrafficSourcesResponse } from 'api/graph_data_units/responseTypes';

export const parsePieData = (
  data: VisitorsTrafficSourcesResponse['data']['attributes'],
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
