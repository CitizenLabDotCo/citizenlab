import { ISmsCampaignData } from './types';

export function isSmsDraft(campaign: ISmsCampaignData) {
  return (
    campaign.attributes.deliveries_count === 0 &&
    !campaign.attributes.scheduled_at
  );
}
