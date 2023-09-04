import { IInitiativeData } from '../types';

export const initiativeData: IInitiativeData = {
  id: '1',
  type: 'initiative',
  attributes: {
    title_multiloc: {
      en: 'Test initiative',
    },
    body_multiloc: {
      en: 'Test initiative description',
    },
    slug: 'test-initiative',
    published_at: '2021-03-01T12:00:00.000Z',
    author_name: 'Test author',
    publication_status: 'published',
    budget: 100000,
    comments_count: 0,
    likes_count: 0,
    location_point_geojson: {
      type: 'Point',
      coordinates: [0, 0],
    },
    location_description: 'Test location',
    created_at: '2021-03-01T12:00:00.000Z',
    updated_at: '2021-03-01T12:00:00.000Z',
    expires_at: '2021-03-01T12:00:00.000Z',
    header_bg: {
      small: 'http://localhost:3000/system/images/1/small/test.jpg',
      medium: 'http://localhost:3000/system/images/1/medium/test.jpg',
      large: 'http://localhost:3000/system/images/1/large/test.jpg',
    },
    anonymous: false,
    internal_comments_count: 0,
    cosponsorships: [],
    editing_locked: false,
    public: true,
    followers_count: 0,
  },
  relationships: {
    topics: {
      data: [
        {
          id: '1',
          type: 'topic',
        },
      ],
    },
    initiative_images: {
      data: [
        {
          id: '1',
          type: 'initiative_image',
        },
      ],
    },
    author: {
      data: {
        id: '1',
        type: 'user',
      },
    },
    assignee: {
      data: {
        id: '1',
        type: 'user',
      },
    },
    user_follower: {
      data: null,
    },
  },
};

export const initiativesData: IInitiativeData[] = [
  initiativeData,
  {
    id: '2',
    type: 'initiative',
    attributes: {
      title_multiloc: {
        en: 'Test initiative 2',
      },
      body_multiloc: {
        en: 'Test initiative description',
      },
      slug: 'test-initiative',
      published_at: '2021-03-01T12:00:00.000Z',
      author_name: 'Test author',
      publication_status: 'published',
      budget: 100000,
      comments_count: 0,
      likes_count: 0,
      location_point_geojson: {
        type: 'Point',
        coordinates: [0, 0],
      },
      location_description: 'Test location',
      created_at: '2021-03-01T12:00:00.000Z',
      updated_at: '2021-03-01T12:00:00.000Z',
      expires_at: '2021-03-01T12:00:00.000Z',
      header_bg: {
        small: 'http://localhost:3000/system/images/1/small/test.jpg',
        medium: 'http://localhost:3000/system/images/1/medium/test.jpg',
        large: 'http://localhost:3000/system/images/1/large/test.jpg',
      },
      anonymous: false,
      internal_comments_count: 0,
      cosponsorships: [],
      editing_locked: false,
      public: true,
      followers_count: 0,
    },
    relationships: {
      topics: {
        data: [
          {
            id: '1',
            type: 'topic',
          },
        ],
      },
      initiative_images: {
        data: [
          {
            id: '1',
            type: 'initiative_image',
          },
        ],
      },
      author: {
        data: {
          id: '1',
          type: 'user',
        },
      },
      assignee: {
        data: {
          id: '1',
          type: 'user',
        },
      },
      user_follower: {
        data: null,
      },
    },
  },
];

export const links = {
  self: 'http://localhost:3000/web_api/v1/initiatives/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  last: 'http://localhost:3000/web_api/v1/initiatives/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  next: 'http://localhost:3000/web_api/v1/initiatives/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  first:
    'http://localhost:3000/web_api/v1/initiatives/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  prev: null,
};

export default jest.fn(() => {
  return { data: { data: initiativesData, links } };
});
