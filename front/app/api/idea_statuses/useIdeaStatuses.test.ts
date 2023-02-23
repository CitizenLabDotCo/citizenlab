import { renderHook } from '@testing-library/react-hooks';

import useIdeaStatuses from './useIdeaStatuses';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*idea_statuses';

export const ideaStatusesData = [
  {
    id: '1',
    type: 'idea_status',
    attributes: {
      code: 'new',
      name_multiloc: {
        en: 'New',
      },
      color: '#FF0000',
      ordering: 1,
      created_at: '2021-03-03T09:00:00.000Z',
      updated_at: '2021-03-03T09:00:00.000Z',
    },
  },
  {
    id: '2',
    type: 'idea_status',
    attributes: {
      code: 'in_progress',
      name_multiloc: {
        en: 'In progress',
      },
      color: '#00FF00',
      ordering: 2,
      created_at: '2021-03-03T09:00:00.000Z',
      updated_at: '2021-03-03T09:00:00.000Z',
    },
  },
];

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideaStatusesData }));
  })
);

describe('useIdeaStatuses', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useIdeaStatuses(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(ideaStatusesData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useIdeaStatuses(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
