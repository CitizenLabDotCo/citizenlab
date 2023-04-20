import { renderHook, act } from '@testing-library/react-hooks';

import useAddCommentVote from './useAddCommentVote';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { voteData } from './__mocks__/useCommentVote';

const apiPath = '*comments/:commentId/votes';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: voteData }));
  })
);

describe('useAddCommentVote', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddCommentVote(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        commentId: 'commentId',
        userId: 'userId',
        mode: 'up',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(voteData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddCommentVote(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        commentId: 'commentId',
        userId: 'userId',
        mode: 'up',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
