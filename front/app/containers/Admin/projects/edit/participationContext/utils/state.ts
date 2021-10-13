import {
  ideaDefaultSortMethodFallback,
  ParticipationMethod,
} from 'services/participationContexts';
import { IParticipationContextConfig } from '..';

export const getNewStateFromData = (data) => {
  const {
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
