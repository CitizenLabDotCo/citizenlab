import { renderHook, act } from '@testing-library/react-hooks';

import useUpdateInitiative from './useUpdateInitiative';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IInitiativeData } from './types';

export const data: IInitiativeData = {
  id: '1',
  type: 'initiative',
  attributes: {
    anonymous: false,
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
    internal_comments_count: 0,
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
    editing_locked: false,
    public: true,
    cosponsorships: [{ user_id: '1', name: 'Cosponsor 1', status: 'accepted' }],
    followers_count: 3,
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

const apiPath = '*initiatives/:initiativeId';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
  })
);

describe('useUpdateInitiative', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateInitiative(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        initiativeId: 'id',
        requestBody: { title_multiloc: { en: 'name' } },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateInitiative(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        initiativeId: 'id',
        requestBody: { title_multiloc: { en: 'name' } },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
