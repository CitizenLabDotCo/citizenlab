import { IPhaseData } from 'services/phases';

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
    participation_method: 'information', // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    upvoting_method: 'limited', // 'limited' | 'unlimited'
    downvoting_method: 'limited', // 'limited' | 'unlimited'
    input_term: 'idea',
    presentation_mode: 'card', // 'card' | 'map'
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
      data: null, // IRelationship | null,
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
    participation_method: 'poll', // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    posting_enabled: false,
    commenting_enabled: false,
    voting_enabled: false,
    upvoting_method: 'limited', // 'limited' | 'unlimited'
    upvoting_limited_max: 0,
    presentation_mode: 'card', // 'card' | 'map'
    max_budget: 3,
    downvoting_method: 'limited', // 'limited' | 'unlimited'
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
      }, // IRelationship,
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
    participation_method: 'ideation', // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    posting_enabled: true,
    commenting_enabled: true,
    voting_enabled: true,
    upvoting_method: 'limited', // 'limited' | 'unlimited'
    downvoting_method: 'limited', // 'limited' | 'unlimited'
    upvoting_limited_max: 5,
    presentation_mode: 'card', // 'card' | 'map'
    downvoting_enabled: false,
    downvoting_limited_max: 0,
    input_term: 'idea',
    ideas_count: 3,
  },
  relationships: {
    permissions: {
      data: [], // IRelationship[],
    },
    project: {
      data: {
        id: 'projectId',
        type: 'project',
      }, // IRelationship,
    },
    user_basket: {
      data: null, // IRelationship | null,
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
    participation_method: 'survey', // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    upvoting_method: 'limited', // 'limited' | 'unlimited'
    downvoting_method: 'limited', // 'limited' | 'unlimited'
    input_term: 'idea',
    presentation_mode: 'card', // 'card' | 'map'
    ideas_count: 3,
    posting_enabled: false,
    commenting_enabled: false,
    voting_enabled: false,
    upvoting_limited_max: 0,
    survey_service: 'typeform', // SurveyServices: 'typeform' | 'survey_monkey' | 'google_forms' cf participationContexts.ts
    survey_embed_url: 'myTestSurvey.typeform.com',
    downvoting_enabled: false,
    downvoting_limited_max: 0,
  },
  relationships: {
    permissions: {
      data: [], // IRelationship[],
    },
    project: {
      data: {
        id: 'projectId',
        type: 'project',
      }, // IRelationship,
    },
    user_basket: {
      data: null, // IRelationship | null,
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
    participation_method: 'survey', // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    upvoting_method: 'limited', // 'limited' | 'unlimited'
    downvoting_method: 'limited', // 'limited' | 'unlimited'
    input_term: 'idea',
    presentation_mode: 'card', // 'card' | 'map'
    posting_enabled: false,
    commenting_enabled: false,
    voting_enabled: false,
    upvoting_limited_max: 0,
    downvoting_enabled: false,
    downvoting_limited_max: 0,
    survey_service: 'google_forms', // SurveyServices: 'typeform' | 'survey_monkey' | 'google_forms' cf participationContexts.ts
    survey_embed_url: 'myTestSurvey.google_forms.com',
    ideas_count: 2,
  },
  relationships: {
    permissions: {
      data: [], // IRelationship[],
    },
    project: {
      data: {
        id: 'projectId',
        type: 'project',
      }, // IRelationship,
    },
    user_basket: {
      data: null, // IRelationship | null,
    },
  },
};
