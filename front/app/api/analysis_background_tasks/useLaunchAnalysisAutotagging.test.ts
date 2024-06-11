import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useLaunchAnalysisAutotagging from './useLaunchAnalysisAutotagging';

const apiPath = '*analyses/:analysisId/auto_taggings';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: {} }, { status: 201 });
  })
);

describe('useLaunchAnalysisAutotagging', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useLaunchAnalysisAutotagging(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        analysisId: 'id',
        autoTaggingMethod: 'nlp_topic',
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

    const { result, waitFor } = renderHook(
      () => useLaunchAnalysisAutotagging(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        analysisId: 'id',
        autoTaggingMethod: 'nlp_topic',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
