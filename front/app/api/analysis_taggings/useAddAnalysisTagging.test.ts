import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { taggingsData } from './__mocks__/useAnalysisTaggings';
import useAddAnalysisTagging from './useAddAnalysisTagging';

const apiPath = '*analyses/:analysisId/taggings';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: taggingsData[0] }, { status: 200 });
  })
);

describe('useAddAnalysisTagging', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddAnalysisTagging(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        inputId: 'inputId',
        tagId: 'tagId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(taggingsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddAnalysisTagging(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        inputId: 'inputId',
        tagId: 'tagId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
