import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useRateAnalysisInsight from './useRateAnalysisInsight';
const apiPath = '*analyses/:analysisId/insights/:id/rate';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(null, { status: 201 });
  })
);

describe('useRateAnalysisInsight', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useRateAnalysisInsight(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        id: '1',
        rating: 'vote_down',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useRateAnalysisInsight(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        id: '1',
        rating: 'vote_down',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
