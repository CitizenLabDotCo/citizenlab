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
    campaign_name: CampaignName;
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

type RegisterUserCampaignName =
  | 'welcome'
  | 'comment_deleted_by_admin'
  | 'comment_on_your_comment'
  | 'comment_on_idea_you_follow'
  | 'comment_on_initiative_you_follow'
  | 'event_upcoming'
  | 'idea_published'
  | 'invite_reminder'
  | 'initiative_published'
  | 'mention_in_official_feedback'
  | 'official_feedback_on_idea_you_follow'
  | 'official_feedback_on_initiative_you_follow'
  | 'project_phase_started'
  | 'project_phase_upcoming'
  | 'project_published'
  | 'status_change_on_idea_you_follow'
  | 'status_change_on_initiative_you_follow'
  | 'user_digest';

export const internalCommentNotificationTypes = [
  'mention_in_internal_comment',
  'internal_comment_on_your_internal_comment',
  'internal_comment_on_idea_assigned_to_you',
  'internal_comment_on_initiative_assigned_to_you',
  'internal_comment_on_idea_you_moderate',
  'internal_comment_on_idea_you_commented_internally_on',
  'internal_comment_on_initiative_you_commented_internally_on',
  'internal_comment_on_unassigned_unmoderated_idea',
  'internal_comment_on_unassigned_initiative',
] as const;

export type InternalCommentType =
  (typeof internalCommentNotificationTypes)[number];

type AdminModeratorCampaignName =
  | 'admin_rights_received'
  | 'comment_marked_as_spam'
  | 'idea_marked_as_spam'
  | 'initiative_assigned_to_you'
  | 'initiative_marked_as_spam'
  | 'new_comment_for_admin'
  | 'new_idea_for_admin'
  | 'new_initiative_for_admin'
  | 'project_folder_moderation_rights_received'
  | 'project_moderation_rights_received'
  | 'threshold_reached_for_admin'
  | 'admin_digest'
  | 'moderator_digest'
  | 'assignee_digest'
  | 'your_proposed_initiatives_digest'
  | InternalCommentType;

export type CampaignName =
  | 'manual'
  | 'invite_received'
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
}
