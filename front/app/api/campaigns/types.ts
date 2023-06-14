import { Keys } from 'utils/cl-react-query/types';
import campaignsKeys from './keys';
import { Multiloc, ILinks, IRelationship } from 'typings';

export type CampaignsKeys = Keys<typeof campaignsKeys>;

export interface ICampaignsData {
  data: ICampaignData[];
  links: ILinks;
}

export interface ICampaignData {
  id: string;
  type: string;
  attributes: {
    campaign_name: string;
    campaign_description_multiloc: Multiloc;
    // Only undefined for invite_received?
    enabled?: boolean;
    subject_multiloc: Multiloc;
    body_multiloc: Multiloc;
    sender: 'author' | 'organization';
    reply_to: 'author' | 'organization';
    created_at: string;
    updated_at: string;
    deliveries_count: number;
    content_type_multiloc: Multiloc;
    content_type_ordering: number;
    recipient_role_multiloc: Multiloc;
    recipient_role_ordering: number;
    // Seems to be always defined, null for invite_received
    recipient_segment_multiloc?: Multiloc | null;
    // Seems to be always defined, null for e.g. invite_received, admin_digest
    trigger_multiloc?: Multiloc | null;
    schedule: any;
    // Undefined for campaigns that are not scheduled
    schedule_multiloc?: Multiloc;
  };
  relationships: {
    author: {
      data: IRelationship;
    };
    groups: {
      data: IRelationship[];
    };
  };
}

export interface CampaignFormValues {
  sender: 'author' | 'organization';
  reply_to: string;
  subject_multiloc: Multiloc;
  body_multiloc: Multiloc;
  group_ids?: string[];
}

type CampaignUpdate =
  | CampaignFormValues
  | {
      enabled: boolean;
    };

export interface IUpdateCampaignProperties {
  id: string;
  campaign: CampaignUpdate;
}

export interface ICampaign {
  data: ICampaignData;
}

export interface QueryParameters {
  campaignNames?: string[];
  withoutCampaignNames?: string[];
  pageSize?: number;
  pageNumber?: number;
}
