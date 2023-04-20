import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteCommentVote from './useDeleteCommentVote';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
const apiPath = '*votes/:voteId';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteCommentVote', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteCommentVote(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        commentId: 'commentId',
        voteId: 'voteId',
      });
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteCommentVote(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        commentId: 'commentId',
        voteId: 'voteId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
