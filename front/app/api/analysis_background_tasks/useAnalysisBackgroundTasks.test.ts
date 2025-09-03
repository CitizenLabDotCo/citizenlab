import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useAnalysisBackgroundTasks from './useAnalysisBackgroundTasks';

const apiPath = '*analyses/:analysisId/background_tasks';

const analysesBackgroundTasksData = [
  {
    id: '1',
    type: 'analysis_background_task',
    attributes: {
      progress: 0,
      type: 'auto_tagging',
      auto_tagging_method: 'text_analysis',
      created_at: '2021-06-29T08:00:00.000Z',
      ended_at: null,
      state: 'queued',
    },
  },
];

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: analysesBackgroundTasksData },
      { status: 200 }
    );
  })
);

describe('useAnalysisBackgroundTasks', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () => useAnalysisBackgroundTasks('analysisId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(analysesBackgroundTasksData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useAnalysisBackgroundTasks('analysisId'),
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
