import { Multiloc, ILinks, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import { CampaignName, CampaignContext } from '../types';

import emailCampaignsKeys from './keys';

export type EmailCampaignsKeys = Keys<typeof emailCampaignsKeys>;

export interface IEmailCampaignsData {
  data: IEmailCampaignData[];
  links: ILinks;
}

// Per-recipient delivery counts for an email campaign, keyed by the email
// delivery lifecycle (Mailgun-tracked).
export interface IEmailDeliveryStats {
  sent: number;
  bounced: number;
  failed: number;
  accepted: number;
  delivered: number;
  opened: number;
  clicked: number;
  total: number;
}

export interface IEmailCampaignData {
  id: string;
  type: string;
  attributes: {
    campaign_name: CampaignName;
    campaign_description_multiloc: Multiloc;
    // Communication channel. Always 'email' for email campaigns.
    channel: 'email';
    // Only undefined for invite_received?
    enabled: boolean;
    can_be_disabled: boolean;
    subject_multiloc: Multiloc;
    body_multiloc: Multiloc;
    title_multiloc?: Multiloc;
    intro_multiloc?: Multiloc;
    button_text_multiloc?: Multiloc;
    sender: 'author' | 'organization';
    reply_to: 'author' | 'organization';
    editable_regions?: IEmailEditableRegion[];
    substitution_variable_keys?: string[];
    created_at: string;
    updated_at: string;
    deliveries_count: number;
    content_type_multiloc: Multiloc;
    content_type_ordering: number;
    campaign_ordering: number;
    recipient_role_multiloc: Multiloc;
    recipient_role_ordering: number;
    // Seems to be always defined, null for invite_received
    recipient_segment_multiloc?: Multiloc | null;
    // Seems to be always defined, null for e.g. invite_received, admin_digest
    trigger_multiloc?: Multiloc | null;
    schedule: any;
    // Undefined for campaigns that are not scheduled
    schedule_multiloc?: Multiloc;
    has_preview: boolean;
    delivery_stats?: IEmailDeliveryStats;
    scheduled_at?: string | null;
  };
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

export interface EmailCampaignFormValues {
  sender: 'author' | 'organization';
  reply_to: string;
  subject_multiloc: Multiloc;
  body_multiloc: Multiloc;
  title_text_multiloc?: Multiloc;
  intro_multiloc?: Multiloc;
  button_text_multiloc?: Multiloc;
  group_ids?: string[];
  scheduled_at?: string | null;
}

export interface IEmailEditableRegion {
  key: string;
  type: 'html' | 'text';
  default_value_multiloc?: Multiloc;
  allow_blank_locales: boolean;
}

type EmailCampaignUpdate =
  | EmailCampaignFormValues
  | {
      enabled: boolean;
    };

export interface IUpdateEmailCampaignProperties {
  id: string;
  campaign: EmailCampaignUpdate;
}

export interface IEmailCampaign {
  data: IEmailCampaignData;
}

export interface EmailCampaignsQueryParameters {
  context?: CampaignContext;
  manual?: boolean;
  withoutCampaignNames?: CampaignName[];
  pageSize?: number;
  pageNumber?: number;
}

export interface IEmailCampaignAdd {
  campaign_name: string;
  context?: CampaignContext;
  enabled?: boolean;
  title_multiloc?: Multiloc;
  subject_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  sender?: string;
  reply_to?: string;
  group_ids?: string[];
}
