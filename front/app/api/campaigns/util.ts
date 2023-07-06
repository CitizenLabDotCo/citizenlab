import { ICampaignData } from './types';

export function isDraft(campaign: ICampaignData) {
  return campaign.attributes.deliveries_count === 0;
}
