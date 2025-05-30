import { VisitorsTrafficSourcesResponse } from 'api/graph_data_units/responseTypes/VisitorsTrafficSourcesWidget';

import { categoricalColorScheme } from 'components/admin/Graphs/styling';

import { keys } from 'utils/helperUtils';
import { roundPercentages } from 'utils/math';

import { Translations } from './translations';
import { PieRow } from './typings';

export const parsePieData = (
  {
    sessions_per_referrer_type,
  }: VisitorsTrafficSourcesResponse['data']['attributes'],
  translations: Translations
): PieRow[] | undefined => {
  const referrerTypes = keys(sessions_per_referrer_type);
  if (referrerTypes.length === 0) return undefined;

  const counts = referrerTypes.map((key) => sessions_per_referrer_type[key]);
  const percentages = roundPercentages(counts);

  return referrerTypes.map((key, i) => ({
    name: translations[key],
    value: counts[i],
    percentage: percentages[i],
    color: categoricalColorScheme({ rowIndex: i }),
  }));
};

export type TranslatedReferrers = {
  referrer_type: string;
  referrer: string;
  visits: number;
  visitors: number;
}[];

export const parseTableData = (
  { top_50_referrers }: VisitorsTrafficSourcesResponse['data']['attributes'],
  translations: Translations
): TranslatedReferrers => {
  return top_50_referrers.map(({ referrer_type, ...rest }) => ({
    ...rest,
    referrer_type: translations[referrer_type],
  }));
};

export const parseExcelData = (
  pieData: PieRow[],
  tableData: TranslatedReferrers,
  translations: Translations
) => {
  const trafficSourceData = pieData.map((row) => ({
    [translations.trafficSource]: row.name,
    [translations.numberOfVisits]: row.value,
    [translations.percentageOfVisits]: row.percentage,
  }));

  const referrerData = tableData.map((row) => ({
    [translations.referrer]: row.referrer,
    [translations.trafficSource]: translations[row.referrer_type],
    [translations.numberOfVisits]: row.visits,
    [translations.numberOfVisitors]: row.visitors,
  }));

  const xlsxData = {
    [translations.trafficSources]: trafficSourceData,
    [translations.referrerWebsites]: referrerData,
  };

  return xlsxData;
};
