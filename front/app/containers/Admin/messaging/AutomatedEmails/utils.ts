import {
  CampaignData,
  GroupedCampaignsEntry,
  SubGroupedCampaignsEntry,
} from './types';

export const groupBy =
  (key: string) =>
  (
    result: GroupedCampaignsEntry[] | SubGroupedCampaignsEntry[],
    current: CampaignData
  ) => {
    const resultObj = Object.fromEntries(result);
    const groupingKey = current[key];
    resultObj[groupingKey] = resultObj[groupingKey] ?? [];
    resultObj[groupingKey].push(current);

    return Object.entries(resultObj);
  };

export const sortBy =
  (key: string) => (a: GroupedCampaignsEntry, b: GroupedCampaignsEntry) => {
    const numA = a[1][0].attributes[`${key}_ordering`];
    const numB = b[1][0].attributes[`${key}_ordering`];
    return numA - numB;
  };
