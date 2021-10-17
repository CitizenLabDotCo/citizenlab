import {
  ideaDefaultSortMethodFallback,
  ParticipationMethod,
} from 'services/participationContexts';
import { IParticipationContextConfig } from '..';

export const getStateFromParticipationMethod = (
  participation_method: ParticipationMethod
) => {
  const ideation = participation_method === 'ideation';
  const budgeting = participation_method === 'budgeting';
  const survey = participation_method === 'survey';
  const ideationOrBudgeting = ideation || budgeting;

  return {
    participation_method,
    posting_enabled: ideation ? true : null,
    commenting_enabled: ideationOrBudgeting ? true : null,
    voting_enabled: ideation ? true : null,
    upvoting_method: ideation ? 'unlimited' : null,
    voting_limited_max: null,
    downvoting_enabled: ideation ? true : null,
    presentation_mode: ideationOrBudgeting ? 'card' : null,
    survey_embed_url: null,
    survey_service: survey ? 'typeform' : null,
    min_budget: budgeting ? 0 : null,
    max_budget: budgeting ? 1000 : null,
    ideas_order: ideationOrBudgeting ? ideaDefaultSortMethodFallback : null,
  } as IParticipationContextConfig;
};
