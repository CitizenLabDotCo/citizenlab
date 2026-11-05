// Shared, channel-agnostic campaign vocabulary. Channel-specific types and
// hooks live in the `email/` and `sms/` subfolders; anything imported by
// non-email/non-sms code (consents, notifications, phases) belongs here.

type RegisterUserCampaignName =
  | 'comment_deleted_by_admin'
  | 'comment_on_idea_you_follow'
  | 'comment_on_your_comment'
  | 'email_confirmation'
  | 'event_registration_confirmation'
  | 'new_email_confirmation'
  | 'idea_published'
  | 'invitation_to_cosponsor'
  | 'mention_in_official_feedback'
  | 'official_feedback_on_idea_you_follow'
  | 'password_reset'
  | 'project_phase_started'
  | 'project_phase_upcoming'
  | 'project_published'
  | 'status_change_on_idea_you_follow'
  | 'user_blocked'
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
  | 'space_moderation_rights_received'
  | 'threshold_reached_for_admin'
  | 'proposal_expired_for_admin'
  | InternalCommentType;

export type CampaignName =
  | 'manual'
  | 'manual_project_participants'
  | 'sms_manual'
  | 'invite_received'
  | 'invite_reminder'
  | RegisterUserCampaignName
  | AdminModeratorCampaignName;

export type CampaignContext = {
  phaseId?: string;
  projectId?: string;
};
