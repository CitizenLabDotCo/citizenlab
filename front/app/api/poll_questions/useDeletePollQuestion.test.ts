import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useDeletePollQuestion from './useDeletePollQuestion';

const apiPath = '*/poll_questions/:questionId';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDeletePollQuestion', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useDeletePollQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        questionId: 'questionId',
        phaseId: '1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.delete(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDeletePollQuestion(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        questionId: 'questionId',
        phaseId: '1',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
