import {
  InputTerm,
  ParticipationMethod,
  PresentationMode,
  VotingMethod,
} from 'services/participationContexts';

export const mockPhaseInformationData = {
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
    participation_method: 'information' as ParticipationMethod, // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    upvoting_method: 'limited' as VotingMethod, // 'limited' | 'unlimited'
    downvoting_method: 'limited' as VotingMethod, // 'limited' | 'unlimited'
    input_term: 'idea' as InputTerm,
    presentation_mode: 'card' as PresentationMode, // 'card' | 'map'
    ideas_count: 3,
    // max_budget?: number,
    // survey_service?: SurveyServices,
    // survey_embed_url?: string,
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
export const mockPhasePollData = {
  id: 'MockPhasePollId',
  type: 'phase',
  attributes: {
    title_multiloc: 'A Mock Poll phase',
    description_multiloc: 'For testing purposes',
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'poll', // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    // posting_enabled: false,
    // commenting_enabled: false,
    // voting_enabled: false,
    // voting_method: 'limited', // 'limited' | 'unlimited'
    // voting_limited_max: 0,
    // presentation_mode: 'card' // 'card' | 'map'
    // max_budget?: number,
    // survey_service?: SurveyServices,
    // survey_embed_url?: string,
  },
  relationships: {
    permissions: {
      //    data: []// IRelationship[],
    },
    project: {
      data: {
        id: 'projectId',
        type: 'project',
      }, // IRelationship,
    },
    // user_basket: {
    //   data: null // IRelationship | null,
    // }
  },
};

export const mockPhaseIdeationData = {
  id: 'MockPhaseIdeationId',
  type: 'phase',
  attributes: {
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'ideation' as ParticipationMethod, // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    posting_enabled: true,
    commenting_enabled: true,
    voting_enabled: true,
    upvoting_method: 'limited' as VotingMethod, // 'limited' | 'unlimited'
    downvoting_method: 'limited' as VotingMethod, // 'limited' | 'unlimited'
    voting_limited_max: 5,
    presentation_mode: 'card' as PresentationMode, // 'card' | 'map'
    upvoting_limited_max: 0,
    downvoting_enabled: false,
    downvoting_limited_max: 0,
    input_term: 'idea' as InputTerm,
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

export const mockPhaseSurveyTypeformData = {
  id: 'MockPhaseSurveyTypeformId',
  type: 'phase',
  attributes: {
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'survey' as ParticipationMethod, // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    upvoting_method: 'limited' as VotingMethod, // 'limited' | 'unlimited'
    downvoting_method: 'limited' as VotingMethod, // 'limited' | 'unlimited'
    input_term: 'idea' as InputTerm,
    presentation_mode: 'card' as PresentationMode, // 'card' | 'map'
    ideas_count: 3,
    posting_enabled: false,
    commenting_enabled: false,
    voting_enabled: false,
    voting_limited_max: 0,
    survey_service: 'typeform', // SurveyServices: 'typeform' | 'survey_monkey' | 'google_forms' cf participationContexts.ts
    survey_embed_url: 'myTestSurvey.typeform.com',
    upvoting_limited_max: 0,
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

export const mockPhaseSurveyGoogleFormData = {
  id: 'MockPhaseSurveyGoogleFormId',
  type: 'phase',
  attributes: {
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    participation_method: 'survey' as ParticipationMethod, // 'ideation' | 'information' | 'survey' | 'budgeting'; cf participationContexts.ts
    upvoting_method: 'limited' as VotingMethod, // 'limited' | 'unlimited'
    downvoting_method: 'limited' as VotingMethod, // 'limited' | 'unlimited'
    input_term: 'idea' as InputTerm,
    presentation_mode: 'card' as PresentationMode, // 'card' | 'map'
    posting_enabled: false,
    commenting_enabled: false,
    voting_enabled: false,
    voting_limited_max: 0,
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
