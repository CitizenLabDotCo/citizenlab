import { IPhaseData } from 'api/phases/types';

export const mockPhaseInformationData: IPhaseData = {
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
export const mockPhasePollData: IPhaseData = {
  id: 'MockPhasePollId',
  type: 'phase',
  attributes: {
    title_multiloc: { en: 'A Mock Poll phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'poll',
    posting_enabled: false,
    commenting_enabled: false,
    voting_enabled: false,
    upvoting_method: 'limited',
    upvoting_limited_max: 0,
    presentation_mode: 'card',
    max_budget: 3,
    downvoting_method: 'limited',
    input_term: 'idea',
    downvoting_enabled: false,
    downvoting_limited_max: 0,
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
};

export const mockPhaseIdeationData: IPhaseData = {
  id: 'MockPhaseIdeationId',
  type: 'phase',
  attributes: {
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'ideation',
    posting_enabled: true,
    commenting_enabled: true,
    voting_enabled: true,
    upvoting_method: 'limited',
    downvoting_method: 'limited',
    upvoting_limited_max: 5,
    presentation_mode: 'card',
    downvoting_enabled: false,
    downvoting_limited_max: 0,
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
};

export const mockPhaseSurveyTypeformData: IPhaseData = {
  id: 'MockPhaseSurveyTypeformId',
  type: 'phase',
  attributes: {
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'survey',
    upvoting_method: 'limited',
    downvoting_method: 'limited',
    input_term: 'idea',
    presentation_mode: 'card',
    ideas_count: 3,
    posting_enabled: false,
    commenting_enabled: false,
    voting_enabled: false,
    upvoting_limited_max: 0,
    survey_service: 'typeform',
    survey_embed_url: 'myTestSurvey.typeform.com',
    downvoting_enabled: false,
    downvoting_limited_max: 0,
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
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'survey',
    upvoting_method: 'limited',
    downvoting_method: 'limited',
    input_term: 'idea',
    presentation_mode: 'card',
    posting_enabled: false,
    commenting_enabled: false,
    voting_enabled: false,
    upvoting_limited_max: 0,
    downvoting_enabled: false,
    downvoting_limited_max: 0,
    survey_service: 'google_forms',
    survey_embed_url: 'myTestSurvey.google_forms.com',
    ideas_count: 2,
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
