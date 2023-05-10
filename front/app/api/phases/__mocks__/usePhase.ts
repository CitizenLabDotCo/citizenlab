import { IPhaseData } from '../types';

export const phaseData: IPhaseData = {
  id: 'MockPhaseInformationId',
  type: 'phase',
  attributes: {
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    posting_enabled: false,
    commenting_enabled: false,
    voting_enabled: false,
    upvoting_limited_max: 0,
    downvoting_enabled: false,
    downvoting_limited_max: 0,
    participation_method: 'information',
    upvoting_method: 'limited',
    downvoting_method: 'limited',
    input_term: 'idea',
    presentation_mode: 'card',
    ideas_count: 3,
  },
  relationships: {
    permissions: {
      data: [],
    },
    project: {
      data: {
        id: 'projectId',
        type: 'project',
      },
    },
    user_basket: {
      data: null,
    },
  },
};
