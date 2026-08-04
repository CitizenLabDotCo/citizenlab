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

export type PhaseDisabledReason =
  | 'project_inactive'
  | 'inactive_phase'
  | UserDisabledReason;

export type AttendingEventDisabledReason =
  | 'project_inactive'
  | UserDisabledReason;

export type PhasePostingDisabledReason =
  | 'posting_not_supported'
  | 'posting_disabled'
  // Only applicable to taking surveys at the moment.
  // Not configurable via admin UI, determined in BE
  | 'posting_limited_max_reached'
  | PhaseDisabledReason;

export type PhaseCommentingDisabledReason =
  | 'commenting_not_supported'
  | 'commenting_disabled'
  | PhaseDisabledReason;

export type PhaseReactingDisabledReason =
  | 'future_enabled' // Note: Not returned by backend but needed for reacting
  | 'reacting_not_supported'
  | 'reacting_disabled'
  | 'reacting_dislike_disabled'
  | 'reacting_like_limited_max_reached'
  | 'reacting_dislike_limited_max_reached'
  | PhaseDisabledReason;

export type PhaseSurveyDisabledReason = 'not_survey' | PhaseDisabledReason;

export type PhasePollDisabledReason =
  | 'not_poll'
  | 'already_responded'
  | PhaseDisabledReason;

export type PhaseDocumentAnnotationDisabledReason =
  | 'not_document_annotation'
  | PhaseDisabledReason;

export type PhaseVotingDisabledReason = 'not_voting' | PhaseDisabledReason;

export type PhaseVolunteeringDisabledReason =
  | 'not_volunteering'
  | PhaseDisabledReason;

export type IdeaReactingDisabledReason =
  | 'idea_not_in_current_phase'
  | PhaseReactingDisabledReason;

export type IdeaCommentingDisabledReason =
  | 'idea_not_in_current_phase'
  | PhaseCommentingDisabledReason;

export type IdeaVotingDisabledReason =
  | 'idea_not_in_current_phase'
  | PhaseVotingDisabledReason;

export type IdeaEditingDisabledReason =
  | 'idea_not_in_current_phase'
  | 'votes_exist'
  | 'published_after_screening'
  | 'not_author'
  | PhaseDisabledReason;

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
  | PhasePostingDisabledReason
  | PhaseCommentingDisabledReason
  | PhaseReactingDisabledReason
  | PhaseSurveyDisabledReason
  | PhasePollDisabledReason
  | PhaseDocumentAnnotationDisabledReason
  | PhaseVotingDisabledReason
  | PhaseVolunteeringDisabledReason
  | IdeaReactingDisabledReason
  | IdeaCommentingDisabledReason
  | IdeaVotingDisabledReason;
