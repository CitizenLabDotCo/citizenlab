import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useAddIdeaReaction from './useAddIdeaReaction';
import { reactionData } from './useIdeaReaction.test';

const apiPath = '*ideas/:ideaId/reactions';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: reactionData }, { status: 200 });
  })
);

describe('useAddIdeaReaction', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddIdeaReaction(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        userId: 'userId',
        mode: 'up',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(reactionData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddIdeaReaction(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        userId: 'userId',
        mode: 'up',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
