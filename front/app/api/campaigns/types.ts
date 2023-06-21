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
  | 'comment_on_your_idea'
  | 'comment_on_your_initiative'
  | 'idea_published'
  | 'invite_reminder'
  | 'initiative_published'
  | 'mention_in_official_feedback'
  | 'new_comment_on_commented_idea'
  | 'new_comment_on_commented_initiative'
  | 'new_comment_on_reacted_idea'
  | 'new_comment_on_reacted_initiative'
  | 'official_feedback_on_commented_idea'
  | 'official_feedback_on_commented_initiative'
  | 'official_feedback_on_reacted_idea'
  | 'official_feedback_on_reacted_initiative'
  | 'official_feedback_on_your_idea'
  | 'official_feedback_on_your_initiative'
  | 'status_change_of_commented_idea'
  | 'status_change_of_commented_initiative'
  | 'status_change_of_reacted_idea'
  | 'status_change_of_reacted_initiative'
  | 'status_change_of_your_idea'
  | 'project_phase_started'
  | 'project_phase_upcoming'
  | 'status_change_of_your_initiative'
  | 'user_digest';

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
  | 'your_proposed_initiatives_digest';

type CampaignName =
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
