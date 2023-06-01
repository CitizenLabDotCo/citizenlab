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

type sortByKey = 'recipient_role' | 'content_type';
export const sortBy =
  (key: sortByKey) =>
  (
    [, campaignArr1]: GroupedCampaignsEntry,
    [, campaignArr2]: GroupedCampaignsEntry
  ) => {
    const campaignA = campaignArr1[0];
    const campaignB = campaignArr2[0];
    const keyOrderings: { [key in sortByKey]: string } = {
      recipient_role: 'recipient_role_ordering',
      content_type: 'content_type_ordering',
    };
    const keyOrdering = keyOrderings[key];
    const numA = campaignA.attributes[keyOrdering];
    const numB = campaignB.attributes[keyOrdering];

    return numA - numB;
  };
