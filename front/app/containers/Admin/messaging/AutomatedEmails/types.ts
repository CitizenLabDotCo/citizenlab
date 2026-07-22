import { IEmailCampaignData } from 'api/campaigns/email/types';

export interface CampaignData extends IEmailCampaignData {
  content_type: string;
  recipient_role: string;
  recipient_segment: string;
  campaign_description: string;
  trigger: string | undefined;
  schedule: string | undefined;
}

export type GroupedCampaignsEntry = [string, CampaignData[]];
export type SubGroupedCampaignsEntry = [string, GroupedCampaignsEntry[]];
