import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useMarkInternalCommentForDeletion from './useMarkInternalCommentForDeletion';

const apiPath = '*internal_comments/:commentId/mark_as_deleted';

const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json(null, { status: 202 });
  })
);

describe('useMarkInternalCommentForDeletion', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(
      () => useMarkInternalCommentForDeletion({ ideaId: 'ideaId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        commentId: 'commentId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useMarkInternalCommentForDeletion({ ideaId: 'ideaId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        commentId: 'commentId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
