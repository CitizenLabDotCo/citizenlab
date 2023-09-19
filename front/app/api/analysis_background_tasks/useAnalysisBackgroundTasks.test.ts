import { renderHook } from '@testing-library/react-hooks';

import useAnalysisBackgroundTasks from './useAnalysisBackgroundTasks';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

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
  rest.get(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: analysesBackgroundTasksData })
    );
  })
);

describe('useAnalysisBackgroundTasks', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
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
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
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
