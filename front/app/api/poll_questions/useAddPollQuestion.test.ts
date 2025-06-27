import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { pollQuestionsData } from './__mocks__/usePollQuestions';
import useAddPollQuestion from './useAddPollQuestion';

const apiPath = '*/poll_questions';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: pollQuestionsData }, { status: 200 });
  })
);

describe('useAddPollQuestion', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddPollQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: '1',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(pollQuestionsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddPollQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: '1',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
