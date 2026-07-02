import { CampaignContext } from '../types';

import { IEmailCampaignData } from './types';

export function isDraft(campaign: IEmailCampaignData) {
  return (
    campaign.attributes.deliveries_count === 0 &&
    !campaign.attributes.scheduled_at
  );
}

export function getCampaignsContextPath({
  projectId,
  phaseId,
}: CampaignContext = {}) {
  if (phaseId) {
    return `phases/${phaseId}/campaigns`;
  } else if (projectId) {
    return `projects/${projectId}/campaigns`;
  }
  return 'campaigns';
}
