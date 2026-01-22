import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { IIdeaData } from '../types';

export const ideaDataWithVotes: IIdeaData[] = [
  {
    id: '1',
    type: 'idea',
    attributes: {
      title_multiloc: {
        en: 'Idea 1 title',
        'nl-BE': 'Doloribus quam molestiae ut.',
      },
      body_multiloc: {
        'nl-BE':
          '\u003cp\u003eEa ea aut. Quasi corrupti iste. Delectus eum voluptates.\u003c/p\u003e\u003cp\u003eEst harum voluptates. Et fugit enim. Suscipit inventore ullam.\u003c/p\u003e\u003cp\u003eEos mollitia omnis. Laudantium porro perferendis. Minus in aut.\u003c/p\u003e',
      },
      author_name: 'Lucas',
      slug: 'idea-1',
      publication_status: 'published',
      likes_count: 10,
      dislikes_count: 1,
      comments_count: 2,
      internal_comments_count: 2,
      official_feedbacks_count: 0,
      location_point_geojson: {
        type: 'Point',
        coordinates: [4.418731568531502, 50.86899604801978],
      },
      location_description: null,
      created_at: '2019-03-12T00: 00: 00.000Z',
      updated_at: '2019-03-26T14: 32: 32.000Z',
      published_at: '2019-03-19T00: 00: 00.000Z',
      budget: 60,
      proposed_budget: 45,
      baskets_count: 10,
      total_votes: 60,
      votes_count: 60,
      action_descriptors: {
        editing_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        reacting_idea: {
          enabled: true,
          disabled_reason: null,
          cancelling_enabled: true,
          up: {
            enabled: true,
            disabled_reason: null,
            future_enabled_at: null,
          },
          down: {
            enabled: true,
            disabled_reason: null,
            future_enabled_at: null,
          },
        },
        commenting_idea: {
          enabled: false,
          disabled_reason: 'user_not_permitted',
          future_enabled_at: null,
        },
        comment_reacting_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        voting: {
          enabled: false,
          disabled_reason: 'inactive_phase',
          future_enabled_at: null,
        },
      },
      anonymous: false,
      author_hash: 'abc123',
      followers_count: 8,
      manual_votes_amount: 0,
    },
    relationships: {
      input_topics: {
        data: [
          {
            id: '1732cff1-b2a0-4e60-9924-9d3fb76861e3',
            type: 'input_topic',
          },
        ],
      },
      idea_images: {
        data: [
          {
            id: '123',
            type: 'image',
          },
        ],
      },
      phases: { data: [] },
      author: {
        data: {
          id: '8ea3a61c-e1bd-4756-a54d-c092553abccd',
          type: 'users',
        },
      },
      project: {
        data: {
          id: 'd2adf974-8e9b-4a3c-8f0e-ff307d53821f',
          type: 'projects',
        },
      },
      idea_status: {
        data: {
          id: '6a968b06-87ea-450a-887c-70b8e8dd4343',
          type: 'idea_statuses',
        },
      },
      ideas_phases: {
        data: [],
      },
      user_follower: {
        data: null,
      },
    },
  },
  {
    id: '2',
    type: 'idea',
    attributes: {
      title_multiloc: {
        en: 'Idea 2 title',
        'nl-BE': 'Doloribus quam molestiae ut.',
      },
      body_multiloc: {
        'nl-BE':
          '\u003cp\u003eEa ea aut. Quasi corrupti iste. Delectus eum voluptates.\u003c/p\u003e\u003cp\u003eEst harum voluptates. Et fugit enim. Suscipit inventore ullam.\u003c/p\u003e\u003cp\u003eEos mollitia omnis. Laudantium porro perferendis. Minus in aut.\u003c/p\u003e',
      },
      author_name: 'Lucas',
      slug: 'idea-2',
      publication_status: 'published',
      likes_count: 10,
      dislikes_count: 1,
      comments_count: 2,
      internal_comments_count: 2,
      official_feedbacks_count: 0,
      total_votes: 0,
      location_point_geojson: {
        type: 'Point',
        coordinates: [4.418731568531502, 50.86899604801978],
      },
      location_description: null,
      created_at: '2019-03-12T00: 00: 00.000Z',
      updated_at: '2019-03-26T14: 32: 32.000Z',
      published_at: '2019-03-19T00: 00: 00.000Z',
      budget: 60,
      proposed_budget: 45,
      votes_count: 0,
      baskets_count: 10,
      action_descriptors: {
        editing_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        reacting_idea: {
          enabled: true,
          disabled_reason: null,
          cancelling_enabled: true,
          up: {
            enabled: true,
            disabled_reason: null,
            future_enabled_at: null,
          },
          down: {
            enabled: true,
            disabled_reason: null,
            future_enabled_at: null,
          },
        },
        commenting_idea: {
          enabled: false,
          disabled_reason: 'user_not_permitted',
          future_enabled_at: null,
        },
        comment_reacting_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        voting: {
          enabled: false,
          disabled_reason: 'inactive_phase',
          future_enabled_at: null,
        },
      },
      anonymous: false,
      author_hash: 'abc123',
      followers_count: 7,
      manual_votes_amount: 0,
    },
    relationships: {
      input_topics: {
        data: [
          {
            id: '1732cff1-b2a0-4e60-9924-9d3fb76861e3',
            type: 'input_topic',
          },
        ],
      },
      ideas_phases: { data: [] },
      idea_images: { data: [] },
      phases: { data: [] },
      author: {
        data: {
          id: '8ea3a61c-e1bd-4756-a54d-c092553abccd',
          type: 'users',
        },
      },
      project: {
        data: {
          id: 'd2adf974-8e9b-4a3c-8f0e-ff307d53821f',
          type: 'projects',
        },
      },
      idea_status: {
        data: {
          id: '6a968b06-87ea-450a-887c-70b8e8dd4343',
          type: 'idea_statuses',
        },
      },
      user_follower: {
        data: null,
      },
    },
  },
];

export const ideaData: IIdeaData[] = [
  {
    id: '1',
    type: 'idea',
    attributes: {
      title_multiloc: {
        en: 'Idea 1 title',
        'nl-BE': 'Doloribus quam molestiae ut.',
      },
      body_multiloc: {
        'nl-BE':
          '\u003cp\u003eEa ea aut. Quasi corrupti iste. Delectus eum voluptates.\u003c/p\u003e\u003cp\u003eEst harum voluptates. Et fugit enim. Suscipit inventore ullam.\u003c/p\u003e\u003cp\u003eEos mollitia omnis. Laudantium porro perferendis. Minus in aut.\u003c/p\u003e',
      },
      author_name: 'Lucas',
      slug: 'idea-1',
      publication_status: 'published',
      likes_count: 10,
      dislikes_count: 1,
      comments_count: 2,
      internal_comments_count: 2,
      total_votes: 0,
      official_feedbacks_count: 0,
      location_point_geojson: {
        type: 'Point',
        coordinates: [4.418731568531502, 50.86899604801978],
      },
      location_description: null,
      created_at: '2019-03-12T00: 00: 00.000Z',
      updated_at: '2019-03-26T14: 32: 32.000Z',
      published_at: '2019-03-19T00: 00: 00.000Z',
      budget: 60,
      proposed_budget: 45,
      baskets_count: 0,
      votes_count: 0,
      action_descriptors: {
        editing_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        reacting_idea: {
          enabled: true,
          disabled_reason: null,
          cancelling_enabled: true,
          up: {
            enabled: true,
            disabled_reason: null,
            future_enabled_at: null,
          },
          down: {
            enabled: true,
            disabled_reason: null,
            future_enabled_at: null,
          },
        },
        commenting_idea: {
          enabled: false,
          disabled_reason: 'user_not_permitted',
          future_enabled_at: null,
        },
        comment_reacting_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        voting: {
          enabled: false,
          disabled_reason: 'user_not_permitted',
          future_enabled_at: null,
        },
      },
      anonymous: false,
      author_hash: 'abc123',
      followers_count: 8,
      manual_votes_amount: 0,
    },
    relationships: {
      input_topics: {
        data: [
          {
            id: '1732cff1-b2a0-4e60-9924-9d3fb76861e3',
            type: 'input_topic',
          },
        ],
      },
      idea_images: {
        data: [
          {
            id: '123',
            type: 'image',
          },
        ],
      },
      phases: { data: [] },
      author: {
        data: {
          id: '8ea3a61c-e1bd-4756-a54d-c092553abccd',
          type: 'users',
        },
      },
      project: {
        data: {
          id: 'd2adf974-8e9b-4a3c-8f0e-ff307d53821f',
          type: 'projects',
        },
      },
      idea_status: {
        data: {
          id: '6a968b06-87ea-450a-887c-70b8e8dd4343',
          type: 'idea_statuses',
        },
      },
      ideas_phases: {
        data: [],
      },
      user_follower: {
        data: null,
      },
    },
  },
  {
    id: '2',
    type: 'idea',
    attributes: {
      title_multiloc: {
        en: 'Idea 2 title',
        'nl-BE': 'Doloribus quam molestiae ut.',
      },
      body_multiloc: {
        'nl-BE':
          '\u003cp\u003eEa ea aut. Quasi corrupti iste. Delectus eum voluptates.\u003c/p\u003e\u003cp\u003eEst harum voluptates. Et fugit enim. Suscipit inventore ullam.\u003c/p\u003e\u003cp\u003eEos mollitia omnis. Laudantium porro perferendis. Minus in aut.\u003c/p\u003e',
      },
      author_name: 'Lucas',
      slug: 'idea-2',
      publication_status: 'published',
      likes_count: 10,
      dislikes_count: 1,
      comments_count: 2,
      internal_comments_count: 2,
      official_feedbacks_count: 0,
      location_point_geojson: {
        type: 'Point',
        coordinates: [4.418731568531502, 50.86899604801978],
      },
      location_description: null,
      created_at: '2019-03-12T00: 00: 00.000Z',
      updated_at: '2019-03-26T14: 32: 32.000Z',
      published_at: '2019-03-19T00: 00: 00.000Z',
      budget: 60,
      proposed_budget: 45,
      votes_count: 0,
      total_votes: 0,
      baskets_count: 0,
      action_descriptors: {
        editing_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        reacting_idea: {
          enabled: true,
          disabled_reason: null,
          cancelling_enabled: true,
          up: {
            enabled: true,
            disabled_reason: null,
            future_enabled_at: null,
          },
          down: {
            enabled: true,
            disabled_reason: null,
            future_enabled_at: null,
          },
        },
        commenting_idea: {
          enabled: false,
          disabled_reason: 'user_not_permitted',
          future_enabled_at: null,
        },
        comment_reacting_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        voting: {
          enabled: false,
          disabled_reason: 'user_not_permitted',
          future_enabled_at: null,
        },
      },
      anonymous: false,
      author_hash: 'abc123',
      followers_count: 7,
      manual_votes_amount: 0,
    },
    relationships: {
      input_topics: {
        data: [
          {
            id: '1732cff1-b2a0-4e60-9924-9d3fb76861e3',
            type: 'input_topic',
          },
        ],
      },
      ideas_phases: { data: [] },
      idea_images: { data: [] },
      phases: { data: [] },
      author: {
        data: {
          id: '8ea3a61c-e1bd-4756-a54d-c092553abccd',
          type: 'users',
        },
      },
      project: {
        data: {
          id: 'd2adf974-8e9b-4a3c-8f0e-ff307d53821f',
          type: 'projects',
        },
      },
      idea_status: {
        data: {
          id: '6a968b06-87ea-450a-887c-70b8e8dd4343',
          type: 'idea_statuses',
        },
      },
      user_follower: {
        data: null,
      },
    },
  },
];

export const links = {
  last: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=9&page%5Bsize%5D=12&sort=random',
  next: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=2&page%5Bsize%5D=12&sort=random',
  self: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  first:
    'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  prev: null,
};

export const apiPathIdeas = `${API_PATH}/ideas`;
export const apiPathMiniIdeas = `${API_PATH}/ideas/mini`;
export const apiPathById = `${API_PATH}/ideas/:ideaId`;
export const apiPathBySlug = `${API_PATH}/ideas/by_slug/:slug`;

const votingIdea = {
  data: {
    id: 'aadd62ad-646c-4351-bafd-3e0f72e68499',
    type: 'idea',
    attributes: {
      title_multiloc: {
        en: 'Option #1 Voting',
      },
      body_multiloc: {
        en: '\u003cp\u003eOption #1 VotingOption #1 VotingOption #1 VotingOption #1 VotingOption #1 VotingOption #1 VotingOption #1 VotingOption #1 VotingOption #1 VotingOption #1 VotingOption #1 Voting\u003c/p\u003e',
      },
      slug: 'option-1-voting',
      publication_status: 'published',
      likes_count: 0,
      dislikes_count: 0,
      comments_count: 0,
      internal_comments_count: 0,
      official_feedbacks_count: 0,
      followers_count: 1,
      location_point_geojson: null,
      location_description: null,
      created_at: '2023-08-11T15:03:47.581Z',
      updated_at: '2023-08-11T15:03:47.581Z',
      published_at: '2023-08-11T15:03:47.581Z',
      budget: null,
      proposed_budget: null,
      baskets_count: 1,
      votes_count: 1,
      anonymous: false,
      author_hash: '5d78eb7936e_d99f2f3b7518aeddde3d45d78eb7936ed99f2f3b75',
      author_name: 'Citizenlab Hermansen',
      action_descriptors: {
        commenting_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        reacting_idea: {
          enabled: false,
          disabled_reason: 'reacting_not_supported',
          cancelling_enabled: false,
          up: {
            enabled: false,
            disabled_reason: 'reacting_not_supported',
            future_enabled_at: null,
          },
          down: {
            enabled: false,
            disabled_reason: 'reacting_not_supported',
            future_enabled_at: null,
          },
        },
        comment_reacting_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
        voting: {
          enabled: true,
          disabled_reason: null,
          future_enabled_at: null,
        },
      },
    },
    relationships: {
      topics: {
        data: [],
      },
      idea_images: {
        data: [],
      },
      phases: {
        data: [],
      },
      ideas_phases: {
        data: [],
      },
      author: {
        data: {
          id: '3d78a40f-91a6-4e80-835e-bca778704c9f',
          type: 'user',
        },
      },
      project: {
        data: {
          id: '276fc6c4-5780-45ff-90a0-e6655b67bc23',
          type: 'project',
        },
      },
      idea_status: {
        data: {
          id: 'fcea429f-f61d-49b3-9985-83f6d3fcd769',
          type: 'idea_status',
        },
      },
      user_reaction: {
        data: null,
      },
      user_follower: {
        data: {
          id: 'd849bb47-b7d1-493e-959c-8e2fd287e9f4',
          type: 'follower',
        },
      },
      assignee: {
        data: {
          id: '1b359a67-8bad-42dc-b9f5-7d5e3eb537b6',
          type: 'user',
        },
      },
      idea_import: {
        data: null,
      },
    },
  },
};

const endpoints = {
  'GET ideas': http.get(apiPathIdeas, () => {
    return HttpResponse.json({ data: ideaData }, { status: 200 });
  }),
  'GET ideas/:id': http.get(apiPathById, () => {
    return HttpResponse.json({ data: ideaData[0] }, { status: 200 });
  }),
  'GET ideas/by_slug/:slug': http.get(apiPathBySlug, () => {
    return HttpResponse.json({ data: ideaData[0] }, { status: 200 });
  }),
};

export const votingIdeaHandler = http.get(apiPathById, () => {
  return HttpResponse.json(votingIdea, { status: 200 });
});

export const votingResultsIdeaHandler = http.get(apiPathById, () => {
  return HttpResponse.json({ data: ideaDataWithVotes[0] }, { status: 200 });
});

export const votingResultsIdeasHandler = http.get(apiPathById, () => {
  return HttpResponse.json({ data: ideaDataWithVotes }, { status: 200 });
});

export default endpoints;
