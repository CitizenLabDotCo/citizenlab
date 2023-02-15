import { renderHook } from '@testing-library/react-hooks';

import useNetwork from './useNetwork';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const tasksData = {
  data: [{ id: 'id', type: 'text_network_analysis_task' }],
};

const networkData = {
  data: {
    id: 'id',
    type: 'network',
    attributes: {
      nodes: [],
      links: [],
    },
  },
};

const apiPathTasks = '*insights/views/:viewId/tasks/text_network_analysis';
const apiPathNetwork = '*insights/views/:viewId/network';

const handlers = [
  rest.get(apiPathTasks, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(tasksData));
  }),
  rest.get(apiPathNetwork, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(networkData));
  }),
];

const server = setupServer(...handlers);

describe('useNetwork', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns isLoading correctly when there are tasks', async () => {
    const { result } = renderHook(() => useNetwork('id'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual(undefined);
  });

  it('returns network data correctly when there are no tasks', async () => {
    server.use(
      rest.get(apiPathTasks, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: [] }));
      })
    );

    const { result, waitFor } = renderHook(() => useNetwork('id'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(networkData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPathNetwork, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useNetwork('id'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
