import { ICampaignData, CampaignContext } from './types';

export function isDraft(campaign: ICampaignData) {
  return campaign.attributes.deliveries_count === 0;
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
