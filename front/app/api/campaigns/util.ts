import { ICampaignData, CampaignContext } from './types';

export function isDraft(campaign: ICampaignData) {
  return campaign.attributes.deliveries_count === 0 && !isScheduled(campaign);
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

export function isScheduled(campaign: ICampaignData | undefined) {
  const scheduledAt = campaign?.attributes.scheduled_at;
  return scheduledAt !== null && scheduledAt !== undefined;
}
