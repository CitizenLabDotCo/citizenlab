import { renderHook } from '@testing-library/react-hooks';

import useSubmissionCount from './useSubmissionCount';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IFormSubmissionCount } from 'api/submission_count/types';

let apiPath = '*projects/:projectId/submission_count';

const statData: IFormSubmissionCount = {
  data: {
    type: 'submission_count',
    attributes: {
      totalSubmissions: 5,
    },
  },
};
const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: statData }));
  })
);

describe('useSubmissionCount', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly for project', async () => {
    const { result, waitFor } = renderHook(
      () => useSubmissionCount({ projectId: 'projectId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(statData);
  });

  it('returns data correctly for phase', async () => {
    const { result, waitFor } = renderHook(
      () => useSubmissionCount({ projectId: 'projectId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(statData);
  });
  it('returns error correctly', async () => {
    apiPath = '*phases/:phaseId/submission_count';
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useSubmissionCount({ projectId: 'projectId', phaseId: 'phaseId' }),
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
