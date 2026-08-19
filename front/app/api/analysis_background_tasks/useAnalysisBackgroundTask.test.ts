import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import insightsKeys from 'api/analysis_insights/keys';

import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import backgroundTasksKeys from './keys';
import useAnalysisBackgroundTask from './useAnalysisBackgroundTask';

const apiPath = '*analyses/:analysisId/background_tasks/:id';

const backgroundTaskData = {
  id: 'task-1',
  type: 'background_task',
  attributes: {
    progress: null,
    type: 'summarization',
    auto_tagging_method: null,
    created_at: '2026-08-18T08:00:00.000Z',
    ended_at: '2026-08-18T08:01:00.000Z',
    state: 'succeeded',
  },
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: backgroundTaskData }, { status: 200 });
  })
);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, wrapper };
};

describe('useAnalysisBackgroundTask', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useAnalysisBackgroundTask('analysis-1', 'task-1'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toEqual(backgroundTaskData);
  });

  it('invalidates the insights of the analysis after its own fetch', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAnalysisBackgroundTask('analysis-1', 'task-1'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: insightsKeys.list({ analysisId: 'analysis-1' }),
      })
    );
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });

  // Regression test for TAN-8535: the insights response side-loads the task,
  // which `fetcher` writes into the cache with setQueryData. Reacting to that
  // write by invalidating insights again made the two queries refetch each
  // other forever.
  it('does not invalidate insights when the task is written into the cache by another response', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAnalysisBackgroundTask('analysis-1', 'task-1'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(invalidateQueries).toHaveBeenCalledTimes(1));

    act(() => {
      queryClient.setQueryData(backgroundTasksKeys.item({ id: 'task-1' }), {
        data: { ...backgroundTaskData },
      });
    });

    await waitFor(() =>
      expect(result.current.dataUpdatedAt).toBeGreaterThan(0)
    );
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });

  it('does not invalidate insights for a task that is already in the cache', async () => {
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(backgroundTasksKeys.item({ id: 'task-1' }), {
      data: backgroundTaskData,
    });
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAnalysisBackgroundTask('analysis-1', 'task-1'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isFetching).toBe(false);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
