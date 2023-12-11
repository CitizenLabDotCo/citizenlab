import { renderHook } from '@testing-library/react-hooks';

import usePollResponses from './usePollResponses';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*phases/:phaseId/poll_responses/responses_count';

const data = {
  data: {
    type: 'responses_count',
    attributes: {
      series: {
        options: {
          '52bb7424-11e1-4a47-a450-48fe90d04cb2': 1,
          'd3f55351-1014-44fa-99b3-32f1a727a3d3': 1,
          'd7065f7c-8b96-4b80-bb28-8b48e3f50f47': 1,
          'df49067b-233b-4f85-85e1-2a6704f5af1d': 2,
        },
      },
    },
  },
};

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
  })
);

describe('usePollResponses', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        usePollResponses({
          phaseId: 'id',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        usePollResponses({
          phaseId: 'id',
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
