import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { summaryData } from './__mocks__/useAnalysisSummary';
import useRegenerateAnalysisSummary from './useRegenerateAnalysisSummary';

const apiPath = '*analyses/:analysisId/summaries/:summaryId/regenerate';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: summaryData }, { status: 200 });
  })
);

describe('useRegenerateAnalysisSummary', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useRegenerateAnalysisSummary(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        summaryId: '2',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(summaryData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useRegenerateAnalysisSummary(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        summaryId: '2',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
