import {
  ParticipationMethod,
  ideaDefaultSortMethodFallback,
} from 'services/participationContexts';
import { State, IParticipationContextConfig } from '..';

export const getDefaultState = () =>
  ({
    participation_method: 'ideation',
    posting_enabled: true,
    commenting_enabled: true,
    voting_enabled: true,
    voting_method: 'unlimited',
    voting_limited_max: 5,
    downvoting_enabled: true,
    presentation_mode: 'card',
    min_budget: null,
    max_budget: null,
    survey_service: null,
    survey_embed_url: null,
    loaded: false,
    noVotingLimit: null,
    minBudgetError: null,
    maxBudgetError: null,
    poll_anonymous: false,
    ideas_order: ideaDefaultSortMethodFallback,
    input_term: 'idea',
  } as State);

export const getNewStateFromData = (data) => {
  const participation_method = data.participation_method as ParticipationMethod;

  const {
    posting_enabled,
    commenting_enabled,
    voting_enabled,
    voting_method,
    voting_limited_max,
    downvoting_enabled,
    presentation_mode,
    min_budget,
    max_budget,
    survey_embed_url,
    survey_service,
    poll_anonymous,
    ideas_order,
    input_term,
  } = data;

  return {
    participation_method,
    posting_enabled,
    commenting_enabled,
    voting_enabled,
    voting_method,
    voting_limited_max,
    downvoting_enabled,
    presentation_mode,
    min_budget,
    max_budget,
    survey_embed_url,
    survey_service,
    poll_anonymous,
    ideas_order,
    input_term,
    loaded: true,
  };
};

export const getStateFromParticipationMethod = (
  participation_method: ParticipationMethod
) =>
  ({
    participation_method,
    posting_enabled: participation_method === 'ideation' ? true : null,
    commenting_enabled:
      participation_method === 'ideation' ||
      participation_method === 'budgeting'
        ? true
        : null,
    voting_enabled: participation_method === 'ideation' ? true : null,
    voting_method: participation_method === 'ideation' ? 'unlimited' : null,
    voting_limited_max: null,
    downvoting_enabled: participation_method === 'ideation' ? true : null,
    presentation_mode:
      participation_method === 'ideation' ||
      participation_method === 'budgeting'
        ? 'card'
        : null,
    survey_embed_url: null,
    survey_service: participation_method === 'survey' ? 'typeform' : null,
    min_budget: participation_method === 'budgeting' ? 0 : null,
    max_budget: participation_method === 'budgeting' ? 1000 : null,
    ideas_order:
      participation_method === 'ideation' ||
      participation_method === 'budgeting'
        ? ideaDefaultSortMethodFallback
        : null,
  } as IParticipationContextConfig);
