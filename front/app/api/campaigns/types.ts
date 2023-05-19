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
    admin_campaign_description_multiloc: Multiloc;
    enabled?: boolean;
    subject_multiloc: Multiloc;
    body_multiloc: Multiloc;
    sender: 'author' | 'organization';
    reply_to: 'author' | 'organization';
    created_at: string;
    updated_at: string;
    deliveries_count: number;
    schedule: any;
    schedule_multiloc: Multiloc;
    content_type_multiloc: Multiloc;
    recipient_role_multiloc: Multiloc;
    recipient_segment_multiloc: Multiloc;
    trigger_multiloc: Multiloc;
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

export interface CampaignAdd extends CampaignFormValues {
  campaign_name: string;
}

export interface ICampaign {
  data: ICampaignData;
}

export interface QueryProps {
  campaignNames?: string[];
  withoutCampaignNames?: string[];
  pageSize?: number;
  pageNumber?: number;
}

export interface QueryParameters {
  campaign_names: string[];
  without_campaign_names: string[];
  'page[number]': number;
  'page[size]': number;
}

export interface IDeliveriesData {
  data: IDeliveryData[];
  links: ILinks;
}
export interface IDeliveryData {
  id: string;
  type: string;
  attributes: {
    delivery_status:
      | 'sent'
      | 'bounced'
      | 'failed'
      | 'accepted'
      | 'delivered'
      | 'opened'
      | 'clicked';
    sent_at: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    user: {
      data: IRelationship;
    };
  };
}

export interface ICampaignStats {
  sent: number;
  bounced: number;
  failed: number;
  accepted: number;
  delivered: number;
  opened: number;
  clicked: number;
  all: number;
}
