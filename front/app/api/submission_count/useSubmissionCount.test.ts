import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { IFormSubmissionCount } from 'api/submission_count/types';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useSubmissionCount from './useSubmissionCount';

let apiPath = '*phases/:phaseId/submission_count';

const statData: IFormSubmissionCount = {
  data: {
    type: 'submission_count',
    attributes: {
      totalSubmissions: 5,
    },
  },
};
const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: statData }, { status: 200 });
  })
);

describe('useSubmissionCount', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly for phase', async () => {
    const { result } = renderHook(
      () => useSubmissionCount({ phaseId: 'phaseId' }),
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
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useSubmissionCount({ phaseId: 'phaseId' }),
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
