import { renderHook, act } from '@testing-library/react-hooks';

import useScanForCategorySuggestions from './useScanForCategorySuggestions';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const tasksData = {
  data: {
    categories_suggestions_task_count: 1,
    type: 'categories_suggestions_task_count',
  },
};

const apiPathTasks = '*insights/views/:viewId/stats/tasks/category_suggestions';
const apiPathTriggerCancel =
  '*insights/views/:viewId/tasks/category_suggestions';

const handlers = [
  rest.get(apiPathTasks, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(tasksData));
  }),
  rest.post(apiPathTriggerCancel, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(tasksData));
  }),
  rest.delete(apiPathTriggerCancel, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: null }));
  }),
];

const server = setupServer(...handlers);

describe('useScanForCategorySuggestions', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns isIdle as initial status', () => {
    const { result } = renderHook(() => useScanForCategorySuggestions('id'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.status).toBe('isIdle');
    expect(result.current.isLoading).toBe(false);
  });

  it('returns isScanning status when scan is triggered and there are tasks', async () => {
    const { result, waitFor } = renderHook(
      () => useScanForCategorySuggestions('id'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.triggerScan();
    });

    await waitFor(() => expect(result.current.status).toBe('isScanning'));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPathTasks, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useScanForCategorySuggestions('id'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.triggerScan();
    });

    await waitFor(() => expect(result.current.status).toBe('isError'));
  });
});
