import { IPhaseData } from '../types';

export const phasesData: IPhaseData[] = [
  {
    id: 'MockPhaseInformationId',
    type: 'phase',
    attributes: {
      allow_anonymous_participation: false,
      title_multiloc: { en: 'A Mock Information phase' },
      description_multiloc: { en: 'For testing purposes' },
      start_at: 'today',
      end_at: 'one week from now',
      created_at: 'yesterday',
      updated_at: 'yesterday but later',
      posting_enabled: false,
      commenting_enabled: false,
      reacting_enabled: false,
      reacting_like_limited_max: 0,
      reacting_dislike_enabled: false,
      reacting_dislike_limited_max: 0,
      participation_method: 'information',
      reacting_like_method: 'limited',
      reacting_dislike_method: 'limited',
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
  },
  {
    id: 'MockPhasePollId',
    type: 'phase',
    attributes: {
      allow_anonymous_participation: false,
      title_multiloc: { en: 'A Mock Poll phase' },
      description_multiloc: { en: 'For testing purposes' },
      start_at: 'today',
      end_at: 'one week from now',
      created_at: 'yesterday',
      updated_at: 'yesterday but later',
      participation_method: 'poll',
      posting_enabled: false,
      commenting_enabled: false,
      reacting_enabled: false,
      reacting_like_method: 'limited',
      reacting_like_limited_max: 0,
      presentation_mode: 'card',
      voting_max_total: 3,
      reacting_dislike_method: 'limited',
      input_term: 'idea',
      reacting_dislike_enabled: false,
      reacting_dislike_limited_max: 0,
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
    },
  },
  {
    id: 'MockPhaseIdeationId',
    type: 'phase',
    attributes: {
      allow_anonymous_participation: false,
      title_multiloc: { en: 'A Mock Information phase' },
      description_multiloc: { en: 'For testing purposes' },
      start_at: 'today',
      end_at: 'one week from now',
      created_at: 'yesterday',
      updated_at: 'yesterday but later',
      participation_method: 'ideation',
      posting_enabled: true,
      commenting_enabled: true,
      reacting_enabled: true,
      reacting_like_method: 'limited',
      reacting_dislike_method: 'limited',
      reacting_like_limited_max: 5,
      presentation_mode: 'card',
      reacting_dislike_enabled: false,
      reacting_dislike_limited_max: 0,
      input_term: 'idea',
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
  },
];

export default jest.fn(() => {
  return { data: { data: phasesData } };
});
