import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { summaryData } from './__mocks__/useAnalysisSummary';
import { ISummaryParams } from './types';
import useAnalysisSummary from './useAnalysisSummary';

const apiPath = '*/analyses/:analysisId/summaries/:id';

const params: ISummaryParams = {
  analysisId: '1',
  id: '1',
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: summaryData }, { status: 200 });
  })
);

describe('useAnalysisSummary', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useAnalysisSummary(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(summaryData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAnalysisSummary(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
