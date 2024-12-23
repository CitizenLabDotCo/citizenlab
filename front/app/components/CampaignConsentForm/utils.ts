import { CampaignConsent, GroupedCampaignConsent } from './typings';

export const groupCampaignsConsent = (campaignConsents) => {
  return Object.entries(campaignConsents).reduce(
    (
      groups: Record<string, GroupedCampaignConsent>,
      [id, consent]: [string, CampaignConsent]
    ): Record<string, GroupedCampaignConsent> => {
      const { consented, content_type } = consent;

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      groups[content_type] = groups[content_type] ?? {
        children: [],
        group_consented: consented,
      };
      groups[content_type].group_consented =
        groups[content_type].group_consented === consented
          ? consented
          : 'mixed';
      groups[content_type].children.push({ id, ...consent });
      groups[content_type].order = consent.content_type_ordering;

      return groups;
    },
    {}
  );
};

export const sortGroupedCampaignConsents = (
  [_contentTypeA, { order: order_a }]: [string, GroupedCampaignConsent],
  [_contentTypeB, { order: order_b }]: [string, GroupedCampaignConsent]
) => order_a - order_b;
