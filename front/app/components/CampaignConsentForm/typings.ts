export interface CampaignConsent {
  campaign_type_description: string;
  content_type: string;
  consented: boolean;
}

export interface CampaignConsentChildren extends CampaignConsent {
  id: string;
}

export interface GroupedCampaignConsent {
  children: CampaignConsentChildren[];
  group_consented: boolean | 'mixed';
}
