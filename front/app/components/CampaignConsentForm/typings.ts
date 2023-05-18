export interface CampaignConsent {
  campaign_type_description: string;
  content_type_ordering: number;
  content_type: string;
  consented: boolean;
}

export interface CampaignConsentChild extends CampaignConsent {
  id: string;
}

export interface GroupedCampaignConsent {
  children: CampaignConsentChild[];
  order: number;
  group_consented: boolean | 'mixed';
}
