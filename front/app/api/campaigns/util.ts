import { ICampaignData, CampaignContext } from './types';

export function isDraft(campaign: ICampaignData) {
  return campaign.attributes.deliveries_count === 0;
}

export function getCampaignsContextPath({
  projectId,
  phaseId,
}: CampaignContext) {
  if (projectId) {
    return `projects/${projectId}/campaigns`;
  } else if (phaseId) {
    return `phases/${phaseId}/campaigns`;
  }
  return 'campaigns';
}
