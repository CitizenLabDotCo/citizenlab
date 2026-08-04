import type React from 'react';

export interface CampaignConsent {
  campaign_type_description: string;
  content_type_ordering: number;
  content_type: string;
  channel: 'email' | 'sms';
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

// A content-type group prepared for rendering: the grouped consents plus a
// channel-namespaced id and the localized content-type label used as its title.
export interface ConsentGroupView extends GroupedCampaignConsent {
  id: string;
  contentType: string;
}

export type ToggleGroupHandler = (
  group: ConsentGroupView
) => (event: React.MouseEvent | React.KeyboardEvent) => void;

export type ToggleConsentHandler = (id: string) => () => void;
