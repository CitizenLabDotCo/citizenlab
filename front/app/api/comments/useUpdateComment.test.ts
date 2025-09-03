import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { commentsData } from './__mocks__/useComments';
import useUpdateComment from './useUpdateComment';

const apiPath = '*comments/:id';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: commentsData[0] }, { status: 200 });
  })
);

describe('useUpdateComment', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(
      () => useUpdateComment({ ideaId: 'ideaId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        commentId: 'commentId',
        body_multiloc: { en: 'name' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(commentsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useUpdateComment({ ideaId: 'ideaId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );
    act(() => {
      result.current.mutate({
        commentId: 'commentId',
        body_multiloc: { en: 'name' },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
