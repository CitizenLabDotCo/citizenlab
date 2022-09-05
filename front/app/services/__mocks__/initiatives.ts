export const addInitiative = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ data: { id: 'initiativeID' } }));
export const updateInitiative = jest
  .fn()
  .mockImplementation(() => Promise.resolve());

export const makeInitiative = (id, enTitle) => ({
  id,
  type: 'ini',
  attributes: {
    title_multiloc: { en: enTitle, 'nl-BE': 'Doloribus quam molestiae ut.' },
    body_multiloc: {
      'nl-BE':
        '\u003cp\u003eEa ea aut. Quasi corrupti iste. Delectus eum voluptates.\u003c/p\u003e\u003cp\u003eEst harum voluptates. Et fugit enim. Suscipit inventore ullam.\u003c/p\u003e\u003cp\u003eEos mollitia omnis. Laudantium porro perferendis. Minus in aut.\u003c/p\u003e',
    },
    author_name: 'Lucas ',
    slug: 'doloribus-quam-molestiae-ut',
    publication_status: 'published',
    upvotes_count: 10,
    comments_count: 2,
    official_feedbacks_count: 0,
    location_point_geojson: {
      type: 'Point',
      coordinates: [4.418731568531502, 50.86899604801978],
    },
    location_description: null,
    created_at: '2019-03-12T00: 00: 00.000Z',
    updated_at: '2019-03-26T14: 32: 32.000Z',
    published_at: '2019-03-19T00: 00: 00.000Z',
  },
  relationships: {
    topics: {
      data: [
        {
          id: '1732cff1-b2a0-4e60-9924-9d3fb76861e3',
          type: 'topics',
        },
      ],
    },
    initiative_images: { data: [] },
    author: {
      data: { id: '8ea3a61c-e1bd-4756-a54d-c092553abccd', type: 'users' },
    },
    initiative_status: {
      data: {
        id: '6a968b06-87ea-450a-887c-70b8e8dd4343',
        type: 'initiative_statuses',
      },
    },
  },
});
