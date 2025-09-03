import { IUpdatedPhaseProperties } from 'api/phases/types';

export const defaultParticipationConfig: IUpdatedPhaseProperties = {
  participation_method: 'ideation',
  submission_enabled: true,
  commenting_enabled: true,
  reacting_enabled: true,
  reacting_like_method: undefined,
  reacting_like_limited_max: null,
  reacting_dislike_enabled: false,
  reacting_dislike_method: undefined,
  reacting_dislike_limited_max: null,
  allow_anonymous_participation: false,
  voting_method: undefined,
  voting_min_total: null,
  voting_max_total: null,
  voting_max_votes_per_idea: 1,
  presentation_mode: 'card',
  ideas_order: undefined,
  input_term: 'idea',
  poll_anonymous: false,
  document_annotation_embed_url: null,
  survey_service: null,
  survey_embed_url: null,
  expire_days_limit: undefined,
  reacting_threshold: undefined,
  prescreening_enabled: undefined,
};

export const ideationDefaultConfig: IUpdatedPhaseProperties = {
  ...defaultParticipationConfig,
  participation_method: 'ideation',
  submission_enabled: true,
  commenting_enabled: true,
  reacting_enabled: true,
  reacting_like_method: 'unlimited',
  reacting_like_limited_max: null,
  reacting_dislike_enabled: false,
  reacting_dislike_method: 'unlimited',
  allow_anonymous_participation: false,
  reacting_dislike_limited_max: null,
  presentation_mode: 'card',
  input_term: 'idea',
  ideas_order: 'trending',
  prescreening_enabled: false,
};

export const nativeSurveyDefaultConfig: IUpdatedPhaseProperties = {
  ...defaultParticipationConfig,
  participation_method: 'native_survey',
  allow_anonymous_participation: false,
  submission_enabled: true,
  reacting_enabled: true,
  reacting_like_method: 'unlimited',
  reacting_dislike_enabled: false,
  reacting_dislike_method: 'unlimited',
};

export const votingDefaultConfig: IUpdatedPhaseProperties = {
  ...defaultParticipationConfig,
  participation_method: 'voting',
  voting_method: 'single_voting',
  voting_min_total: 0,
  voting_max_total: 100,
  voting_max_votes_per_idea: 1,
  commenting_enabled: true,
  autoshare_results_enabled: true,
  presentation_mode: 'card',
  ideas_order: 'random',
  input_term: 'idea',
  vote_term: 'vote',
};

export const surveyDefaultConfig: IUpdatedPhaseProperties = {
  ...defaultParticipationConfig,
  participation_method: 'survey',
  survey_service: 'typeform',
};

export const proposalsDefaultConfig: IUpdatedPhaseProperties = {
  ...defaultParticipationConfig,
  participation_method: 'proposals',
  submission_enabled: true,
  commenting_enabled: true,
  reacting_enabled: true,
  reacting_like_method: 'unlimited',
  reacting_dislike_enabled: false,
  reacting_dislike_method: undefined,
  allow_anonymous_participation: false,
  reacting_dislike_limited_max: null,
  presentation_mode: 'card',
  input_term: 'proposal',
  ideas_order: 'trending',
  expire_days_limit: 90,
  reacting_threshold: 300,
  prescreening_enabled: false,
};
