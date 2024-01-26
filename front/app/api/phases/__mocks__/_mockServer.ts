import { rest } from 'msw';
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
      campaigns_settings: { project_phase_started: true },
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
      campaigns_settings: { project_phase_started: true },
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
      campaigns_settings: { project_phase_started: true },
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

export const mockPhaseInformationData: IPhaseData = {
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
    campaigns_settings: { project_phase_started: true },
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

export const mockPhaseIdeationData: IPhaseData = {
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
    campaigns_settings: { project_phase_started: true },
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

export const mockPhaseSurveyTypeformData: IPhaseData = {
  id: 'MockPhaseSurveyTypeformId',
  type: 'phase',
  attributes: {
    allow_anonymous_participation: false,
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'survey',
    reacting_like_method: 'limited',
    reacting_dislike_method: 'limited',
    input_term: 'idea',
    presentation_mode: 'card',
    ideas_count: 3,
    posting_enabled: false,
    commenting_enabled: false,
    reacting_enabled: false,
    reacting_like_limited_max: 0,
    survey_service: 'typeform',
    survey_embed_url: 'myTestSurvey.typeform.com',
    reacting_dislike_enabled: false,
    reacting_dislike_limited_max: 0,
    campaigns_settings: { project_phase_started: true },
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

export const mockPhaseSurveyGoogleFormData: IPhaseData = {
  id: 'MockPhaseSurveyGoogleFormId',
  type: 'phase',
  attributes: {
    allow_anonymous_participation: false,
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'survey',
    reacting_like_method: 'limited',
    reacting_dislike_method: 'limited',
    input_term: 'idea',
    presentation_mode: 'card',
    posting_enabled: false,
    commenting_enabled: false,
    reacting_enabled: false,
    reacting_like_limited_max: 0,
    reacting_dislike_enabled: false,
    reacting_dislike_limited_max: 0,
    survey_service: 'google_forms',
    survey_embed_url: 'myTestSurvey.google_forms.com',
    ideas_count: 2,
    campaigns_settings: { project_phase_started: true },
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

export const apiPathPhase = '/web_api/v1/phases/:id';
export const apiPathPhases = '/web_api/v1/projects/:projectId/phases';

const endpoints = {
  'GET phases/:id': rest.get(apiPathPhase, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: phasesData[0] }));
  }),
  'GET projects/:projectId/phases': rest.get(
    apiPathPhases,
    (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: phasesData }));
    }
  ),
};

const votingPhase: any = {
  id: 'voting-phase',
  type: 'phase',
  attributes: {
    allow_anonymous_participation: false,
    title_multiloc: { en: 'A Mock voting phase' },
    description_multiloc: { en: 'For testing purposes' },
    participation_method: 'voting',
    voting_method: 'single_voting',
    poll_anonymous: false,
    survey_embed_url: null,
    survey_service: null,
    document_annotation_embed_url: null,
    start_at: '2023-11-12',
    end_at: '2025-11-19',
    created_at: '2023-11-12T11:05:43.934Z',
    updated_at: '2024-01-25T17:29:22.242Z',
    ideas_count: 0,
    campaigns_settings: {
      project_phase_started: true,
    },
    posting_enabled: true,
    posting_method: 'unlimited',
    posting_limited_max: 1,
    commenting_enabled: true,
    reacting_enabled: true,
    reacting_like_method: 'unlimited',
    reacting_like_limited_max: 10,
    reacting_dislike_enabled: true,
    reacting_dislike_method: 'unlimited',
    reacting_dislike_limited_max: 10,
    presentation_mode: 'card',
    ideas_order: 'random',
    input_term: 'idea',
    voting_max_total: 1,
    voting_min_total: 0,
    voting_max_votes_per_idea: 1,
    baskets_count: 0,
    voting_term_singular_multiloc: {
      en: 'vote',
      'nl-BE': 'stem',
      'fr-BE': 'vote',
      'de-DE': 'Stimme',
      'es-CL': 'votar',
      'sr-Latn': 'vote',
      'da-DK': 'stem',
    },
    voting_term_plural_multiloc: {
      en: 'votes',
      'nl-BE': 'stemmen',
      'fr-BE': 'votes',
      'de-DE': 'Stimmen',
      'es-CL': 'votos',
      'sr-Latn': 'votes',
      'da-DK': 'afstemninger',
    },
    votes_count: 0,
    previous_phase_end_at_updated: false,
  },
};

export const votingPhaseHandler = rest.get(apiPathPhase, (_req, res, ctx) => {
  return res(ctx.status(200), ctx.json({ data: votingPhase }));
});

export default endpoints;
