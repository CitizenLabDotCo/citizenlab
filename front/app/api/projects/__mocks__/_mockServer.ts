import { rest } from 'msw';
import { IProjects, IProjectData, IProject } from '../types';

export const project1: IProjectData = {
  id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
  type: 'project',
  attributes: {
    allow_anonymous_participation: false,
    survey_embed_url: null,
    survey_service: null,
    poll_anonymous: false,
    participation_method: 'ideation',
    posting_enabled: true,
    followers_count: 2,
    // MISMATCH: doesn't seem to exist on our type
    // posting_method: "unlimited",
    // posting_limited_max: 1,
    commenting_enabled: true,
    reacting_enabled: true,
    reacting_like_method: 'unlimited',
    reacting_like_limited_max: 10,
    reacting_dislike_enabled: false,
    reacting_dislike_method: 'unlimited',
    reacting_dislike_limited_max: 10,
    presentation_mode: 'card',
    voting_min_total: 0,
    voting_max_total: null,
    ideas_order: 'trending',
    input_term: 'idea',
    description_preview_multiloc: {
      en: 'You can propose anywhere you like, but we will only accept Koekenbakstraat',
    },
    title_multiloc: {
      en: 'Choose where to plant the tree',
      'de-DE': 'Sheisse',
      'es-CL': 'Renewing River Park',
      'fr-BE': "Choisissez ou planter l'arbre",
      'nl-BE': 'Kies waar de boom te planten',
    },
    comments_count: 1,
    ideas_count: 5,
    include_all_areas: false,
    internal_role: null,
    process_type: 'continuous',
    slug: 'choose-where-to-plant-the-tree',
    visible_to: 'public',
    created_at: '2019-05-11T17:04:13.090Z',
    updated_at: '2023-03-22T08:36:22.662Z',
    folder_id: null,
    publication_status: 'published',
    description_multiloc: {
      en: '<p>You can propose anywhere you like, but we will only accept Koekenbakstraat</p>',
    },
    header_bg: {
      large:
        'https://demo.stg.citizenlab.co/uploads/c7e20cb9-f253-4c0c-aea1-e6e3c23c04c7/project/header_bg/be3f645b-3e1d-4afc-b91b-d68c4dc0100b/large_header_bg.jpeg',
    },
    action_descriptor: {
      posting_idea: {
        enabled: true,
        disabled_reason: null,
        future_enabled: null,
      },
      commenting_idea: {
        enabled: true,
        disabled_reason: null,
      },
      reacting_idea: {
        enabled: true,
        disabled_reason: null,
        up: {
          enabled: true,
          disabled_reason: null,
        },
        down: {
          enabled: false,
          disabled_reason: 'disliking_disabled',
        },
      },
      // MISMATCH: this attribute doesn't exist on our type
      // comment_reacting_idea: {
      //   enabled: true,
      //   disabled_reason: null
      // },
      taking_survey: {
        enabled: false,
        disabled_reason: 'not_survey',
      },
      taking_poll: {
        enabled: false,
        disabled_reason: 'not_poll',
      },
      annotating_document: {
        enabled: false,
        disabled_reason: 'not_document_annotation',
      },
    },
    avatars_count: 8,
    participants_count: 8,
    // MISMATCH: this attribute doesn't exist on our type
    // allocated_budget: 0
    uses_content_builder: false,
  },
  relationships: {
    admin_publication: {
      data: {
        id: 'bf9f26f1-678a-4af0-993c-cb1ebacca7f4',
        type: 'admin_publication',
      },
    },
    project_images: {
      data: [
        {
          id: '552492c7-488a-4774-8577-7566f3a52eb0',
          type: 'project_image',
        },
      ],
    },
    areas: {
      data: [],
    },
    topics: {
      data: [],
    },
    avatars: {
      data: [
        {
          id: '867affc5-9356-4f71-b64f-6ae219595681',
          type: 'avatar',
        },
        {
          id: '231c73b0-c14d-48ce-9d9b-d24a76201ec7',
          type: 'avatar',
        },
        {
          id: '77ed1d53-5a50-4fdc-918a-c3df01aa46b1',
          type: 'avatar',
        },
      ],
    },
    user_basket: {
      data: null,
    },
    user_follower: {
      data: null,
    },
    default_assignee: {
      data: null,
    },
  },
};

export const project2: IProjectData = {
  id: '4b429681-1744-456f-8550-e89a2c2c74b2',
  type: 'project',
  attributes: {
    allow_anonymous_participation: false,
    survey_embed_url: null,
    survey_service: null,
    poll_anonymous: false,
    participation_method: 'ideation',
    posting_enabled: true,
    // MISMATCH: doesn't seem to exist on our type
    // posting_method: "unlimited",
    // MISMATCH: doesn't seem to exist on our type
    // posting_limited_max: 1,
    commenting_enabled: true,
    reacting_enabled: true,
    reacting_like_method: 'unlimited',
    reacting_like_limited_max: 10,
    followers_count: 2,
    reacting_dislike_enabled: true,
    reacting_dislike_method: 'unlimited',
    reacting_dislike_limited_max: 10,
    presentation_mode: 'card',
    voting_min_total: 0,
    voting_max_total: null,
    ideas_order: 'trending',
    input_term: 'idea',
    description_preview_multiloc: {},
    title_multiloc: {
      en: 'Permissions test',
      'da-DK': 'Permissions test',
      'de-DE': 'Permissions test',
      'es-CL': 'Permissions test',
      'fr-BE': 'Permissions test',
      'nl-BE': 'Permissions test',
      'sr-Latn': 'Permissions test',
    },
    comments_count: 1,
    ideas_count: 4,
    include_all_areas: false,
    internal_role: null,
    process_type: 'continuous',
    slug: 'permissions-test',
    visible_to: 'public',
    created_at: '2023-05-03T10:23:53.038Z',
    updated_at: '2023-05-03T11:18:43.979Z',
    folder_id: null,
    publication_status: 'published',
    description_multiloc: {},
    header_bg: {
      large: null,
    },
    action_descriptor: {
      posting_idea: {
        enabled: true,
        disabled_reason: null,
        future_enabled: null,
      },
      commenting_idea: {
        enabled: true,
        disabled_reason: null,
      },
      reacting_idea: {
        enabled: true,
        disabled_reason: null,
        up: {
          enabled: true,
          disabled_reason: null,
        },
        down: {
          enabled: true,
          disabled_reason: null,
        },
      },
      annotating_document: {
        enabled: false,
        disabled_reason: 'not_document_annotation',
      },
      // MISMATCH: this attribute doesn't exist on our type
      // comment_reacting_idea: {
      //   enabled: true,
      //   disabled_reason: null
      // },
      taking_survey: {
        enabled: false,
        disabled_reason: 'not_survey',
      },
      taking_poll: {
        enabled: false,
        disabled_reason: 'not_poll',
      },
    },
    avatars_count: 6,
    participants_count: 6,
    // MISMATCH: doesn't seem to exist on our type
    // allocated_budget: 0
    uses_content_builder: false,
  },
  relationships: {
    admin_publication: {
      data: {
        id: '9512ba9a-2f7a-4e5b-9003-95c4b8e1367e',
        type: 'admin_publication',
      },
    },
    project_images: {
      data: [],
    },
    areas: {
      data: [],
    },
    topics: {
      data: [],
    },
    avatars: {
      data: [
        {
          id: '6395414a-b410-4cdb-9fc9-77086799a6ed',
          type: 'avatar',
        },
        {
          id: '3d78a40f-91a6-4e80-835e-bca778704c9f',
          type: 'avatar',
        },
      ],
    },
    user_basket: {
      data: null,
    },
    user_follower: {
      data: null,
    },
    default_assignee: {
      data: {
        id: '1b359a67-8bad-42dc-b9f5-7d5e3eb537b6',
        type: 'assignee',
      },
    },
  },
};

export const projects: IProjects = {
  data: [project1, project2],
  links: {
    self: 'http://demo.stg.citizenlab.co/web_api/v1/projects?filter_can_moderate=true&page%5Bnumber%5D=1&page%5Bsize%5D=250&publication_statuses%5B%5D=draft&publication_statuses%5B%5D=published&publication_statuses%5B%5D=archived',
    first:
      'http://demo.stg.citizenlab.co/web_api/v1/projects?filter_can_moderate=true&page%5Bnumber%5D=1&page%5Bsize%5D=250&publication_statuses%5B%5D=draft&publication_statuses%5B%5D=published&publication_statuses%5B%5D=archived',
    last: 'http://demo.stg.citizenlab.co/web_api/v1/projects?filter_can_moderate=true&page%5Bnumber%5D=1&page%5Bsize%5D=250&publication_statuses%5B%5D=draft&publication_statuses%5B%5D=published&publication_statuses%5B%5D=archived',
    prev: null,
    next: null,
  },
};

const votingProject: IProject = {
  data: {
    id: '276fc6c4-5780-45ff-90a0-e6655b67bc23',
    type: 'project',
    attributes: {
      document_annotation_embed_url: null,
      poll_anonymous: false,
      survey_embed_url: null,
      survey_service: null,
      participation_method: 'voting',
      posting_enabled: true,
      // MISMATCH
      // posting_method: "unlimited",
      // posting_limited_max: 1,
      commenting_enabled: true,
      reacting_enabled: true,
      reacting_like_method: 'unlimited',
      reacting_like_limited_max: 10,
      reacting_dislike_enabled: true,
      reacting_dislike_method: 'unlimited',
      reacting_dislike_limited_max: 10,
      allow_anonymous_participation: false,
      presentation_mode: 'card',
      ideas_order: 'random',
      input_term: 'idea',
      voting_method: 'multiple_voting',
      voting_max_total: 10,
      voting_min_total: 0,
      voting_max_votes_per_idea: 1,
      baskets_count: 2,
      voting_term_singular_multiloc: {
        en: 'pick',
      },
      voting_term_plural_multiloc: {
        en: 'picks',
      },
      votes_count: 2,
      description_preview_multiloc: {},
      title_multiloc: {
        en: 'Luuc voting test',
      },
      comments_count: 0,
      ideas_count: 1,
      followers_count: 2,
      include_all_areas: false,
      internal_role: null,
      process_type: 'continuous',
      slug: 'luuc-voting-test',
      visible_to: 'groups',
      created_at: '2023-08-09T09:57:44.129Z',
      updated_at: '2023-10-19T10:25:13.230Z',
      folder_id: null,
      publication_status: 'published',
      description_multiloc: {},
      header_bg: {
        large: null,
      },
      action_descriptor: {
        posting_idea: {
          enabled: false,
          disabled_reason: 'not_ideation',
          future_enabled: null,
        },
        commenting_idea: {
          enabled: true,
          disabled_reason: null,
        },
        reacting_idea: {
          enabled: false,
          disabled_reason: 'not_ideation',
          up: {
            enabled: false,
            disabled_reason: 'not_ideation',
          },
          down: {
            enabled: false,
            disabled_reason: 'not_ideation',
          },
        },
        // MISMATCH
        // comment_reacting_idea: {
        //   enabled: true,
        //   disabled_reason: null
        // },
        annotating_document: {
          enabled: false,
          disabled_reason: 'not_document_annotation',
        },
        taking_survey: {
          enabled: false,
          disabled_reason: 'not_survey',
        },
        taking_poll: {
          enabled: false,
          disabled_reason: 'not_poll',
        },
        // MISMATCH
        // voting: {
        //   enabled: true,
        //   disabled_reason: null
        // }
      },
      avatars_count: 2,
      participants_count: 2,
      // MISMATCH
      // allocated_budget: 0,
      uses_content_builder: true,
    },
    relationships: {
      admin_publication: {
        data: {
          id: '8efd352a-e4c9-478f-a108-1fbdd7e5747a',
          type: 'admin_publication',
        },
      },
      project_images: {
        data: [],
      },
      areas: {
        data: [],
      },
      topics: {
        data: [],
      },
      avatars: {
        data: [
          {
            id: 'a5167d4e-9f3a-4430-b973-8717ccb94dad',
            type: 'avatar',
          },
          {
            id: '3d78a40f-91a6-4e80-835e-bca778704c9f',
            type: 'avatar',
          },
        ],
      },
      permissions: {
        data: [
          {
            id: 'd73b7647-ea39-4bab-8391-d9da0a4c11cb',
            type: 'permission',
          },
          {
            id: '1d12f7ff-6a86-478a-9314-26ebfdf90cca',
            type: 'permission',
          },
        ],
      },
      user_basket: {
        data: null,
      },
      user_follower: {
        data: {
          id: '678ee006-231f-4d1f-a666-9c65a7b588af',
          type: 'follower',
        },
      },
      default_assignee: {
        data: {
          id: '1b359a67-8bad-42dc-b9f5-7d5e3eb537b6',
          type: 'assignee',
        },
      },
    },
  },
};

export const apiPathById = '/web_api/v1/projects/:id';
export const apiPathBySlug = '/web_api/v1/projects/by_slug/:slug';
export const apiPathAll = '/web_api/v1/projects';

const endpoints = {
  'GET projects/:id': rest.get(apiPathById, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: project1 }));
  }),
  'GET projects/by_slug/:slug': rest.get(apiPathBySlug, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: project2 }));
  }),
  'GET projects': rest.get(apiPathAll, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(projects));
  }),
};

export const votingProjectHandler = rest.get(apiPathById, (_req, res, ctx) => {
  return res(ctx.status(200), ctx.json(votingProject));
});

export default endpoints;
