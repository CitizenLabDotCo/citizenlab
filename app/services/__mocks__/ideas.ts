import { BehaviorSubject } from 'rxjs';
import { IIdeas, IIdeaData } from 'services/ideas';

const mockIdeas = new BehaviorSubject<IIdeas | null>(null);

export const __setMockIdeas = (ideas: IIdeas) => {
  mockIdeas.next(ideas);
};

export const ideasStream = jest.fn((_ideas) => {
  const observable = mockIdeas;
  return {
    observable
  };
});

export const getIdea = (id: string, enTitle?: string): IIdeaData => ({
  id,
  type: 'idea',
  attributes: {
    title_multiloc: { en: enTitle, 'nl-BE': 'Doloribus quam molestiae ut.' },
    body_multiloc: { 'nl-BE': '\u003cp\u003eEa ea aut. Quasi corrupti iste. Delectus eum voluptates.\u003c/p\u003e\u003cp\u003eEst harum voluptates. Et fugit enim. Suscipit inventore ullam.\u003c/p\u003e\u003cp\u003eEos mollitia omnis. Laudantium porro perferendis. Minus in aut.\u003c/p\u003e' },
    author_name: 'Lucas ',
    slug: 'doloribus-quam-molestiae-ut',
    publication_status: 'published',
    upvotes_count: 10,
    downvotes_count: 1,
    comments_count: 2,
    location_point_geojson: {
      type: 'Point',
      coordinates: [4.418731568531502, 50.86899604801978]
    },
    location_description: null,
    created_at: '2019-03-12T00: 00: 00.000Z',
    updated_at: '2019-03-26T14: 32: 32.000Z',
    published_at: '2019-03-19T00: 00: 00.000Z',
    budget: 60,
    proposed_budget: 45,
    baskets_count: 0,
    action_descriptor: {
      voting_idea: {
        enabled: true,
        disabled_reason: null,
        future_enabled: null,
        cancelling_enabled: true,
        downvoting_enabled: true
      },
      commenting_idea: {
        enabled: false,
        disabled_reason: 'not_permitted',
        future_enabled: null
      },
      comment_voting_idea: {
        enabled: true
      },
      budgeting: {
        enabled: false,
        disabled_reason: 'not_permitted',
        future_enabled: null
      }
    }
  },
  relationships: {
    topics: {
      data: [{
        id: '1732cff1-b2a0-4e60-9924-9d3fb76861e3',
        type: 'topics'
      }]
    },
    areas: { data: [] },
    idea_images: { data: [] },
    phases: { data: [] },
    author: {
      data: {
        id: '8ea3a61c-e1bd-4756-a54d-c092553abccd',
        type: 'users'
      }
    },
    project: {
      data: {
        id: 'd2adf974-8e9b-4a3c-8f0e-ff307d53821f',
        type: 'projects'
      }
    },
    idea_status: {
      data: {
        id: '6a968b06-87ea-450a-887c-70b8e8dd4343',
        type: 'idea_statuses'
      }
    }
  }
});
