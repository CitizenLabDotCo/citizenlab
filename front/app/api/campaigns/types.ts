import { Multiloc, ILinks, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import campaignsKeys from './keys';

export type CampaignsKeys = Keys<typeof campaignsKeys>;

export interface ICampaignsData {
  data: ICampaignData[];
  links: ILinks;
}

export interface ICampaignData {
  id: string;
  type: string;
  attributes: {
    context_id?: string;
    campaign_name: CampaignName;
    campaign_description_multiloc: Multiloc;
    // Only undefined for invite_received?
    enabled?: boolean;
    subject_multiloc: Multiloc;
    body_multiloc: Multiloc;
    sender: 'author' | 'organization';
    reply_to: 'author' | 'organization';
    custom_text_multiloc?: Multiloc;
    editable_regions?: EditableRegion[];
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
    delivery_stats?: {
      sent: number;
      bounced: number;
      failed: number;
      accepted: number;
      delivered: number;
      opened: number;
      clicked: number;
      total: number;
    };
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
  custom_text_multiloc?: Multiloc;
  group_ids?: string[];
}

export interface EditableRegion {
  key: string;
  title_multiloc: Multiloc;
  type: 'html' | 'text';
  variables: string[];
  default_value_multiloc?: Multiloc;
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

type RegisterUserCampaignName =
  | 'comment_deleted_by_admin'
  | 'comment_on_idea_you_follow'
  | 'comment_on_your_comment'
  | 'event_registration_confirmation'
  | 'idea_published'
  | 'invitation_to_cosponsor'
  | 'mention_in_official_feedback'
  | 'official_feedback_on_idea_you_follow'
  | 'project_phase_started'
  | 'project_phase_upcoming'
  | 'project_published'
  | 'status_change_on_idea_you_follow'
  | 'user_digest'
  | 'voting_basket_not_submitted'
  | 'voting_basket_submitted'
  | 'voting_last_chance'
  | 'voting_phase_started'
  | 'voting_results'
  | 'welcome';

export const internalCommentNotificationTypes = [
  'internal_comment_on_idea_assigned_to_you',
  'internal_comment_on_idea_you_commented_internally_on',
  'internal_comment_on_idea_you_moderate',
  'internal_comment_on_unassigned_unmoderated_idea',
  'internal_comment_on_your_internal_comment',
  'mention_in_internal_comment',
] as const;

export type InternalCommentType =
  (typeof internalCommentNotificationTypes)[number];

type AdminModeratorCampaignName =
  | 'admin_digest'
  | 'admin_rights_received'
  | 'assignee_digest'
  | 'comment_marked_as_spam'
  | 'idea_assigned_to_you'
  | 'idea_marked_as_spam'
  | 'inappropriate_content_flagged'
  | 'moderator_digest'
  | 'new_comment_for_admin'
  | 'new_idea_for_admin'
  | 'project_folder_moderation_rights_received'
  | 'project_moderation_rights_received'
  | 'threshold_reached_for_admin'
  | InternalCommentType;

export type CampaignName =
  | 'manual'
  | 'manual_project_participants'
  | 'invite_received'
  | 'invite_reminder'
  | RegisterUserCampaignName
  | AdminModeratorCampaignName;

export interface QueryParameters {
  campaignNames?: CampaignName[];
  withoutCampaignNames?: CampaignName[];
  pageSize?: number;
  pageNumber?: number;
}

export interface CampaignAdd {
  campaign_name: string;
  subject_multiloc: Multiloc;
  body_multiloc: Multiloc;
  sender: string;
  reply_to?: string;
  group_ids?: string[];
  context_id?: string;
}
