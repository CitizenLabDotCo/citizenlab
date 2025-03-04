import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { questionData } from './__mocks__/useAnalysisQuestion';
import useAddAnalysisQuestion from './useAddAnalysisQuestion';

const apiPath = '*analyses/:analysisId/questions';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: questionData }, { status: 200 });
  })
);

describe('useAddAnalysisQuestion', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddAnalysisQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        filters: {
          comments_from: 4,
        },
        question: 'What is the meaning of life?',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(questionData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddAnalysisQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        analysisId: '1',
        filters: {
          comments_from: 4,
        },
        question: 'What is the meaning of life?',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
