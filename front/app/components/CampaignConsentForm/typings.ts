export interface CampaignConsent {
  campaign_type_description: string;
  content_type: string;
  consented: boolean;
}

export interface CampaignConsentChild extends CampaignConsent {
  id: string;
}

export interface GroupedCampaignConsent {
  children: CampaignConsentChild[];
  group_consented: boolean | 'mixed';
}
