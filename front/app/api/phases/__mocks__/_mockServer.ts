import { addDays, format } from 'date-fns';
import { http, HttpResponse } from 'msw';

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
      end_at: format(addDays(new Date(), 21), 'yyyy-MM-dd'),
      created_at: 'yesterday',
      updated_at: 'yesterday but later',
      submission_enabled: false,
      commenting_enabled: false,
      reacting_enabled: false,
      reacting_like_limited_max: 0,
      reacting_dislike_enabled: false,
      reacting_dislike_limited_max: 0,
      participation_method: 'ideation',
      reacting_like_method: 'limited',
      reacting_dislike_method: 'limited',
      input_term: 'idea',
      presentation_mode: 'card',
      ideas_count: 3,
      votes_count: 0,
      vote_term: 'vote',
      baskets_count: 0,
      report_public: false,
      total_votes_amount: 0,
      user_data_collection: 'all_data',
      voting_filtering_enabled: false,
      user_fields_in_form_enabled: false,
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
      submission_enabled: false,
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
      votes_count: 0,
      vote_term: 'vote',
      baskets_count: 0,
      report_public: false,
      total_votes_amount: 0,
      user_data_collection: 'all_data',
      voting_filtering_enabled: false,
      user_fields_in_form_enabled: false,
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
      submission_enabled: true,
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
      votes_count: 0,
      vote_term: 'vote',
      baskets_count: 0,
      report_public: false,
      total_votes_amount: 0,
      user_data_collection: 'all_data',
      voting_filtering_enabled: false,
      user_fields_in_form_enabled: false,
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
    submission_enabled: false,
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
    votes_count: 0,
    vote_term: 'vote',
    baskets_count: 0,
    report_public: false,
    total_votes_amount: 0,
    user_data_collection: 'all_data',
    voting_filtering_enabled: false,
    user_fields_in_form_enabled: false,
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
    submission_enabled: true,
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
    vote_term: 'vote',
    votes_count: 0,
    baskets_count: 0,
    report_public: false,
    total_votes_amount: 0,
    user_data_collection: 'all_data',
    voting_filtering_enabled: false,
    user_fields_in_form_enabled: false,
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
    submission_enabled: false,
    commenting_enabled: false,
    reacting_enabled: false,
    reacting_like_limited_max: 0,
    survey_service: 'typeform',
    survey_embed_url: 'myTestSurvey.typeform.com',
    reacting_dislike_enabled: false,
    reacting_dislike_limited_max: 0,
    votes_count: 0,
    vote_term: 'vote',
    baskets_count: 0,
    report_public: false,
    total_votes_amount: 0,
    user_data_collection: 'all_data',
    voting_filtering_enabled: false,
    user_fields_in_form_enabled: false,
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
    submission_enabled: false,
    commenting_enabled: false,
    reacting_enabled: false,
    reacting_like_limited_max: 0,
    reacting_dislike_enabled: false,
    reacting_dislike_limited_max: 0,
    survey_service: 'google_forms',
    survey_embed_url: 'myTestSurvey.google_forms.com',
    ideas_count: 2,
    votes_count: 0,
    vote_term: 'vote',
    baskets_count: 0,
    report_public: false,
    total_votes_amount: 0,
    user_data_collection: 'all_data',
    voting_filtering_enabled: false,
    user_fields_in_form_enabled: false,
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
  'GET phases/:id': http.get(apiPathPhase, () => {
    return HttpResponse.json({ data: phasesData[0] }, { status: 200 });
  }),
  'GET projects/:projectId/phases': http.get(apiPathPhases, () => {
    return HttpResponse.json({ data: phasesData }, { status: 200 });
  }),
};

const votingPhase: IPhaseData = {
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
    submission_enabled: true,
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
    votes_count: 100,
    total_votes_amount: 100,
    vote_term: 'vote',
    report_public: false,
    user_data_collection: 'all_data',
    voting_filtering_enabled: true,
    user_fields_in_form_enabled: false,
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

export const votingPhaseHandler = http.get(apiPathPhase, () => {
  return HttpResponse.json({ data: votingPhase }, { status: 200 });
});

export const votingPastNoResultPhaseHandler = http.get(apiPathPhase, () => {
  const votingPhasePastNoResultSharing = votingPhase;
  votingPhasePastNoResultSharing.attributes.autoshare_results_enabled = false;
  votingPhasePastNoResultSharing.attributes.start_at = '2023-11-10';
  votingPhasePastNoResultSharing.attributes.end_at = '2023-11-19';

  return HttpResponse.json(
    { data: votingPhasePastNoResultSharing },
    { status: 200 }
  );
});

export const budgetingPastNoResultPhaseHandler = http.get(apiPathPhase, () => {
  const votingPhasePastNoResultSharing = votingPhase;
  votingPhasePastNoResultSharing.attributes.voting_method = 'budgeting';
  votingPhasePastNoResultSharing.attributes.voting_max_total = 1000;
  votingPhasePastNoResultSharing.attributes.start_at = '2023-11-10';
  votingPhasePastNoResultSharing.attributes.end_at = '2023-11-19';

  return HttpResponse.json(
    { data: votingPhasePastNoResultSharing },
    { status: 200 }
  );
});

export const votingPhaseAutoshareDisabledHandler = http.get(
  apiPathPhase,
  () => {
    const votingPhaseAutoshareDisabled = votingPhase;
    votingPhaseAutoshareDisabled.attributes.autoshare_results_enabled = false;

    return HttpResponse.json(
      { data: votingPhaseAutoshareDisabled },
      { status: 200 }
    );
  }
);

export default endpoints;
