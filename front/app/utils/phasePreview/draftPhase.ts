import { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';

export const UNSAVED_PHASE_ID = 'preview-unsaved-phase';

// Unsaved phases have no server permissions or participation resources yet.
const disabled = {
  enabled: false,
  disabled_reason: 'project_inactive',
} as const;

export const createDraftPhase = (
  projectId: string,
  draft: IUpdatedPhaseProperties
): IPhaseData => ({
  id: UNSAVED_PHASE_ID,
  type: 'phase',
  attributes: {
    placement_type: draft.placement_type ?? 'on_timeline',
    participation_method: draft.participation_method ?? 'ideation',
    title_multiloc: draft.title_multiloc ?? {},
    description_multiloc: draft.description_multiloc ?? {},
    draft_description_multiloc: draft.draft_description_multiloc ?? {},
    // Empty dates represent the unconfigured editor fields, not simulated dates.
    start_at: draft.start_at ?? '',
    end_at: draft.end_at ?? null,
    created_at: '1970-01-01T00:00:00Z',
    updated_at: '1970-01-01T00:00:00Z',
    input_term: draft.input_term ?? 'idea',
    submission_enabled: draft.submission_enabled ?? false,
    commenting_enabled: draft.commenting_enabled ?? false,
    reacting_enabled: draft.reacting_enabled ?? false,
    reacting_like_method: draft.reacting_like_method ?? 'unlimited',
    reacting_like_limited_max: draft.reacting_like_limited_max ?? 0,
    reacting_dislike_enabled: draft.reacting_dislike_enabled ?? false,
    reacting_dislike_method: draft.reacting_dislike_method ?? 'unlimited',
    reacting_dislike_limited_max: draft.reacting_dislike_limited_max ?? 0,
    allow_anonymous_participation: draft.allow_anonymous_participation ?? false,
    presentation_mode: draft.presentation_mode ?? 'card',
    available_views: draft.available_views ?? ['card'],
    voting_method: draft.voting_method,
    voting_min_total: draft.voting_min_total,
    voting_max_total: draft.voting_max_total,
    voting_max_votes_per_idea: draft.voting_max_votes_per_idea,
    vote_term: draft.vote_term,
    native_survey_title_multiloc: draft.native_survey_title_multiloc,
    native_survey_button_multiloc: draft.native_survey_button_multiloc,
    ideas_count: 0,
    votes_count: 0,
    baskets_count: 0,
    total_votes_amount: 0,
    report_public: false,
    voting_filtering_enabled: draft.voting_filtering_enabled ?? false,
    user_fields_in_form_enabled: false,
    user_data_collection: 'all_data',
    supports_form_logic: false,
    supports_public_visibility: false,
    action_descriptors: {
      posting_idea: disabled,
      commenting_idea: disabled,
      comment_reacting_idea: disabled,
      reacting_idea: { ...disabled, up: disabled, down: disabled },
      taking_survey: disabled,
      taking_poll: disabled,
      annotating_document: disabled,
      voting: disabled,
      volunteering: disabled,
    },
  },
  relationships: {
    project: { data: { id: projectId, type: 'project' } },
    permissions: { data: [] },
    user_basket: { data: null },
  },
});
