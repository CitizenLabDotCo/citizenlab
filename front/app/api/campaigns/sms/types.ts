import { Multiloc, ILinks, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import smsCampaignsKeys from './keys';

export type SmsCampaignsKeys = Keys<typeof smsCampaignsKeys>;

interface ISmsCampaignAttributes {
  campaign_name: 'sms_manual';
  channel: 'sms';
  enabled: boolean;
  // Admin-facing label for the SMS campaign (SMS has no email subject line).
  subject_multiloc: Multiloc;
  body_multiloc: Multiloc;
  deliveries_count: number;
  // Undefined/null for campaigns that are not scheduled.
  scheduled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ISmsCampaignData {
  id: string;
  type: string;
  attributes: ISmsCampaignAttributes;
  relationships: {
    author: {
      data: IRelationship;
    };
    context?: {
      data?: IRelationship;
    };
    groups: {
      data: IRelationship[];
    };
  };
}

export interface ISmsCampaignsData {
  data: ISmsCampaignData[];
  links: ILinks;
}

export interface ISmsCampaign {
  data: ISmsCampaignData;
}

export interface SmsCampaignFormValues {
  subject_multiloc: Multiloc;
  body_multiloc: Multiloc;
  group_ids?: string[];
}

export interface ISmsCampaignAdd {
  subject_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  group_ids?: string[];
  enabled?: boolean;
}

type SmsCampaignUpdate =
  | SmsCampaignFormValues
  | {
      enabled: boolean;
    };

export interface IUpdateSmsCampaignProperties {
  id: string;
  campaign: SmsCampaignUpdate;
}

export interface SmsCampaignsQueryParameters {
  pageSize?: number;
  pageNumber?: number;
}
