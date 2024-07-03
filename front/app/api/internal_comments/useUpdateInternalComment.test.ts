import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { commentsData } from './__mocks__/useInternalComments';
import useUpdateInternalComment from './useUpdateInternalComment';

const apiPath = '*internal_comments/:id';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: commentsData[0] }, { status: 200 });
  })
);

describe('useUpdateInternalComment', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useUpdateInternalComment({ ideaId: 'ideaId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        commentId: 'commentId',
        body: 'name',
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

    const { result, waitFor } = renderHook(
      () => useUpdateInternalComment({ ideaId: 'ideaId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );
    act(() => {
      result.current.mutate({
        commentId: 'commentId',
        body: 'name',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
