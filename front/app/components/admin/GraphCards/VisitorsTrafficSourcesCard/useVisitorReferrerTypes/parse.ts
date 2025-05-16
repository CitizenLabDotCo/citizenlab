import { VisitorsTrafficSourcesResponse } from 'api/graph_data_units/responseTypes/VisitorsTrafficSourcesWidget';

import { categoricalColorScheme } from 'components/admin/Graphs/styling';

import { roundPercentages } from 'utils/math';

import { Translations } from './translations';
import { PieRow } from './typings';
import { keys } from 'utils/helperUtils';

export const parsePieData = (
  {
    sessions_per_referrer_type,
  }: VisitorsTrafficSourcesResponse['data']['attributes'],
  translations: Translations
): PieRow[] | null => {
  const referrerTypes = keys(sessions_per_referrer_type);
  if (referrerTypes.length === 0) return null;

  const counts = referrerTypes.map((key) => sessions_per_referrer_type[key]);
  const percentages = roundPercentages(counts);

  return referrerTypes.map((key, i) => ({
    name: translations[key],
    value: counts[i],
    percentage: percentages[i],
    color: categoricalColorScheme({ rowIndex: i }),
  }));
};

export const parseTableData = (
  { top_50_referrers }: VisitorsTrafficSourcesResponse['data']['attributes'],
  translations: Translations
) => {
  return top_50_referrers.map(({ referrer_type, ...rest }) => ({
    ...rest,
    referrer_type: translations[referrer_type],
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
