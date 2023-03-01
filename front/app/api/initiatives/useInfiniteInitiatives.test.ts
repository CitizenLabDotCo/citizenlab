import { renderHook } from '@testing-library/react-hooks';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IInitiativeData } from './types';
import useInfiniteInitiatives from './useInfiniteInitiatives';
const links = {
  self: 'http://localhost:3000/web_api/v1/initiatives/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  last: 'http://localhost:3000/web_api/v1/initiatives/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  next: 'http://localhost:3000/web_api/v1/initiatives/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  first:
    'http://localhost:3000/web_api/v1/initiatives/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  prev: null,
};
const data: IInitiativeData[] = [
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
];

const apiPath = '*initiatives';
const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data, links }));
  })
);

describe('useInfiniteInitiatives', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly with next page', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useInfiniteInitiatives({
          pageNumber: 1,
          search: '',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(data);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('returns data correctly with no next page', async () => {
    const newLinks = { ...links, next: null };
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data, links: newLinks }));
      })
    );
    const { result, waitFor } = renderHook(
      () =>
        useInfiniteInitiatives({
          pageNumber: 1,
          search: '',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(data);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useInfiniteInitiatives({
          pageNumber: 1,
          search: '',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
