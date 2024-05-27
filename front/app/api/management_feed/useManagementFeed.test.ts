import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { ManagementFeed } from './types';
import useManagementFeed from './useManagementFeed';

const managementFeedData: ManagementFeed = {
  data: [
    {
      id: '1',
      type: 'activity',
      attributes: {
        action: 'created',
        acted_at: '2021-01-01T00:00:00Z',
        item_id: '1',
        project_id: '1',
        item_type: 'idea',
        item_slug: 'idea-slug',
        item_title_multiloc: {
          en: 'Idea title',
        },
        change: null,
        item_exists: true,
      },
      relationships: {
        user: {
          data: {
            id: '1',
            type: 'user',
          },
        },
        item: {
          data: {
            id: '1',
            type: 'idea',
          },
        },
      },
    },
  ],
  links: {
    self: 'http://localhost:3000/api/v1/management_feed?page[number]=1',
    first: 'http://localhost:3000/api/v1/management_feed?page[number]=1',
    last: 'http://localhost:3000/api/v1/management_feed?page[number]=1',
    prev: null,
    next: null,
  },
};

const apiPath = '*activities';
const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: managementFeedData }));
  })
);

describe('useManagementFeed', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useManagementFeed({
          pageNumber: 1,
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(managementFeedData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useManagementFeed({
          pageNumber: 1,
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
