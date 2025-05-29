export type DisabledReasonFixable =
  | 'user_not_signed_in'
  | 'user_not_active'
  | 'user_not_verified'
  | 'user_missing_requirements';

type DisabledReasonUnfixable =
  | 'user_not_permitted'
  | 'user_not_in_group'
  | 'user_blocked';

export type UserDisabledReason =
  | DisabledReasonFixable
  | DisabledReasonUnfixable;

export type ProjectDisabledReason =
  | 'project_not_visible'
  | 'project_inactive'
  | UserDisabledReason;

export type ProjectPostingDisabledReason =
  | 'future_enabled' // Note: Not returned by backend but needed for posting
  | 'inactive_phase' // Note: Not returned by backend but needed for posting
  | 'posting_not_supported'
  | 'posting_disabled'
  // Only applicable to taking surveys at the moment.
  // Not configurable via admin UI, determined in BE
  | 'posting_limited_max_reached'
  | ProjectDisabledReason;

export type ProjectCommentingDisabledReason =
  | 'commenting_not_supported'
  | 'commenting_disabled'
  | ProjectDisabledReason;

export type ProjectReactingDisabledReason =
  | 'reacting_not_supported'
  | 'reacting_disabled'
  | 'reacting_dislike_disabled'
  | 'reacting_like_limited_max_reached'
  | 'reacting_dislike_limited_max_reached'
  | ProjectDisabledReason;

export type ProjectSurveyDisabledReason = 'not_survey' | ProjectDisabledReason;

export type ProjectPollDisabledReason =
  | 'not_poll'
  | 'already_responded'
  | ProjectDisabledReason;

export type ProjectDocumentAnnotationDisabledReason =
  | 'not_document_annotation'
  | ProjectDisabledReason;

export type ProjectVotingDisabledReason = 'not_voting' | ProjectDisabledReason;

export type ProjectVolunteeringDisabledReason =
  | 'not_volunteering'
  | ProjectDisabledReason;

export type IdeaReactingDisabledReason =
  | 'idea_not_in_current_phase'
  | ProjectReactingDisabledReason;

export type IdeaCommentingDisabledReason =
  | 'idea_not_in_current_phase'
  | ProjectCommentingDisabledReason;

export type IdeaVotingDisabledReason =
  | 'idea_not_in_current_phase'
  | 'inactive_phase'
  | ProjectVotingDisabledReason;

export type IdeaEditingDisabledReason =
  | 'idea_not_in_current_phase'
  | 'votes_exist'
  | 'published_after_screening'
  | 'not_author'
  | ProjectDisabledReason;

export type ActionDescriptor<DisabledReason> =
  | { enabled: true; disabled_reason: null }
  | { enabled: false; disabled_reason: DisabledReason };

// If future_enabled_at is a string, it's a date
// Note: Only applicable to 'posting_idea', 'commenting_idea', 'reacting_idea', 'voting'
export type ActionDescriptorFutureEnabled<DisabledReason> =
  | { enabled: true; disabled_reason: null; future_enabled_at: null }
  | {
      enabled: false;
      disabled_reason: DisabledReason;
      future_enabled_at: string | null;
    };

// NOTE: Bit of a shim to add in the budgeting action - even though it doesn't really exist
export type ActionDescriptorAction =
  | 'posting_idea'
  | 'commenting_idea'
  | 'reacting_idea'
  | 'voting'
  | 'budgeting'
  | 'annotating_document'
  | 'taking_survey'
  | 'taking_poll'
  | 'attending_event'
  | 'volunteering'
  | 'reacting_idea';

// All disabled reasons
export type DisabledReason =
  | UserDisabledReason
  | ProjectPostingDisabledReason
  | ProjectCommentingDisabledReason
  | ProjectReactingDisabledReason
  | ProjectSurveyDisabledReason
  | ProjectPollDisabledReason
  | ProjectDocumentAnnotationDisabledReason
  | ProjectVotingDisabledReason
  | ProjectVolunteeringDisabledReason
  | IdeaReactingDisabledReason
  | IdeaCommentingDisabledReason
  | IdeaVotingDisabledReason;
