export const initiativesData = [
  {
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
      upvotes_count: 0,
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
    },
  },
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
      upvotes_count: 0,
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
    },
  },
];

export default jest.fn(() => {
  return { data: { data: initiativesData } };
});
