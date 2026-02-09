import { IIdeaData } from 'api/ideas/types';

export const ideasData: IIdeaData[] = [
  {
    id: '1',
    type: 'idea',
    attributes: {
      title_multiloc: {
        en: 'Idea 1 title',
      },
      body_multiloc: {
        en: '\u003cp\u003eEa ea aut. Quasi corrupti iste. Delectus eum voluptates.\u003c/p\u003e\u003cp\u003eEst harum voluptates. Et fugit enim. Suscipit inventore ullam.\u003c/p\u003e\u003cp\u003eEos mollitia omnis. Laudantium porro perferendis. Minus in aut.\u003c/p\u003e',
      },
      author_name: ' 583222',
      slug: 'idea-1',
      publication_status: 'draft',
      likes_count: 0,
      dislikes_count: 0,
      comments_count: 0,
      internal_comments_count: 0,
      official_feedbacks_count: 0,
      location_point_geojson: null,
      location_description: null,
      created_at: '2019-03-12T00: 00: 00.000Z',
      updated_at: '2019-03-26T14: 32: 32.000Z',
      published_at: '2019-03-19T00: 00: 00.000Z',
      budget: null,
      proposed_budget: null,
      baskets_count: 0,
      total_votes: 0,
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
      followers_count: 0,
      manual_votes_amount: 0,
    },
    relationships: {
      input_topics: {
        data: [],
      },
      idea_images: { data: [] },
      ideas_phases: { data: [] },
      phases: { data: [] },
      author: {
        data: {
          id: '8ea3a61c-e1bd-4756-a54d-c092553abccd',
          type: 'user',
        },
      },
      project: {
        data: {
          id: 'd2adf974-8e9b-4a3c-8f0e-ff307d53821f',
          type: 'projects',
        },
      },
      idea_status: {
        data: null,
      },
      user_follower: {
        data: null,
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: ideasData } };
});
