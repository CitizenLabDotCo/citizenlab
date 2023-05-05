// typings
import { CampaignConsent, GroupedCampaignConsent } from './typings';

export const groupConsentCampaigns = (campaignConsents) => {
  return Object.entries(campaignConsents).reduce(
    (
      groups: Record<string, GroupedCampaignConsent>,
      [id, consent]: [string, CampaignConsent]
    ): Record<string, GroupedCampaignConsent> => {
      const { consented, content_type } = consent;

      groups[content_type] = groups[content_type] ?? {
        children: [],
        group_consented: consented,
      };
      groups[content_type].group_consented =
        groups[content_type].group_consented === consented
          ? consented
          : 'mixed';
      groups[content_type].children.push({ id, ...consent });

      return groups;
    },
    {}
  );
};
