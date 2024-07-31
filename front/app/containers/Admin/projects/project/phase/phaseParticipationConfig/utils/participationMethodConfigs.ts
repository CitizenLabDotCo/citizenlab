import { Multiloc } from 'typings';

import {
  IdeaDefaultSortMethod,
  InputTerm,
  ParticipationMethod,
  TSurveyService,
  VotingMethod,
} from 'api/phases/types';

export interface IPhaseParticipationConfig {
  participation_method: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method?: 'unlimited' | 'limited' | null;
  reacting_like_limited_max?: number | null;
  reacting_dislike_enabled?: boolean | null;
  allow_anonymous_participation?: boolean | null;
  voting_method?: VotingMethod | null;
  reacting_dislike_method?: 'unlimited' | 'limited' | null;
  reacting_dislike_limited_max?: number | null;
  presentation_mode?: 'map' | 'card' | null;
  ideas_order?: IdeaDefaultSortMethod;
  input_term?: InputTerm;
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  voting_max_votes_per_idea?: number | null;
  voting_term_singular_multiloc?: Multiloc | null;
  voting_term_plural_multiloc?: Multiloc | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  poll_anonymous?: boolean;
  document_annotation_embed_url?: string | null;
}

export const defaultParticipationConfig: IPhaseParticipationConfig = {
  participation_method: 'ideation',
  posting_enabled: true,
  commenting_enabled: true,
  reacting_enabled: true,
  reacting_like_method: undefined,
  reacting_like_limited_max: null,
  reacting_dislike_enabled: true,
  reacting_dislike_method: undefined,
  reacting_dislike_limited_max: null,
  allow_anonymous_participation: false,
  voting_method: null,
  voting_min_total: null,
  voting_max_total: null,
  voting_max_votes_per_idea: 1,
  voting_term_singular_multiloc: null,
  voting_term_plural_multiloc: null,
  presentation_mode: 'card',
  ideas_order: null,
  input_term: 'idea',
  poll_anonymous: false,
  document_annotation_embed_url: null,
  survey_service: null,
  survey_embed_url: null,
};

export const ideationDefaultConfig: IPhaseParticipationConfig = {
  ...defaultParticipationConfig,
  participation_method: 'ideation',
  posting_enabled: true,
  commenting_enabled: true,
  reacting_enabled: true,
  reacting_like_method: 'unlimited',
  reacting_like_limited_max: null,
  reacting_dislike_enabled: true,
  reacting_dislike_method: 'unlimited',
  allow_anonymous_participation: false,
  reacting_dislike_limited_max: null,
  presentation_mode: 'card',
  input_term: 'idea',
  ideas_order: 'trending',
};

export const nativeSurveyDefaultConfig: IPhaseParticipationConfig = {
  ...defaultParticipationConfig,
  participation_method: 'native_survey',
  allow_anonymous_participation: false,
  posting_enabled: true,
  reacting_enabled: true,
  reacting_like_method: 'unlimited',
  reacting_dislike_enabled: true,
  reacting_dislike_method: 'unlimited',
};

export const votingDefaultConfig: IPhaseParticipationConfig = {
  ...defaultParticipationConfig,
  participation_method: 'voting',
  voting_method: 'single_voting',
  voting_min_total: 0,
  voting_max_total: 100,
  voting_max_votes_per_idea: 1,
  commenting_enabled: true,
  presentation_mode: 'card',
  ideas_order: 'random',
  input_term: 'idea',
};

export const surveyDefaultConfig: IPhaseParticipationConfig = {
  ...defaultParticipationConfig,
  participation_method: 'survey',
  survey_service: 'typeform',
};

export const proposalsDefaultConfig: IPhaseParticipationConfig = {
  ...defaultParticipationConfig,
  participation_method: 'proposals',
  posting_enabled: true,
  commenting_enabled: true,
  reacting_enabled: true,
  reacting_like_method: 'unlimited',
  reacting_dislike_enabled: false,
  reacting_dislike_method: undefined,
  allow_anonymous_participation: false,
  reacting_dislike_limited_max: null,
  presentation_mode: 'card',
  // input_term: 'proposal', // TODO: add later
  ideas_order: 'trending',
};
