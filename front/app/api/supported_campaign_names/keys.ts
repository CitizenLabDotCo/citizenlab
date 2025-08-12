import { CampaignContext } from 'api/campaigns/types';

const baseKey = { type: 'campaign' };

export const supportedCampaignNamesKeys = {
  lists: (context?: CampaignContext) => [
    { ...baseKey, operation: 'supported_campaign_names', context },
  ],
};

export default supportedCampaignNamesKeys;
