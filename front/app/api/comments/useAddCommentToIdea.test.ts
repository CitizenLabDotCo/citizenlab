import { renderHook, act } from '@testing-library/react-hooks';

import useAddCommentToIdea from './useAddCommentToIdea';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IComment } from './types';

const commentData: IComment = {
  data: {
    id: 'commentId',
    type: 'comment',
    attributes: {
      body_multiloc: { en: 'body_multiloc' },
      created_at: 'created_at',
      publication_status: 'published',
      upvotes_count: 0,
      downvotes_count: 0,
      children_count: 0,
      updated_at: 'updated_at',
    },
    relationships: {
      post: {
        data: {
          id: 'postId',
          type: 'post',
        },
      },
      author: {
        data: {
          id: 'authorId',
          type: 'author',
        },
      },
      parent: {
        data: {
          id: 'parentId',
          type: 'parent',
        },
      },
    },
  },
};

const apiPath = '*/ideas/:ideaId/comments';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: commentData }));
  })
);

describe('useAddCommentToIdea', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddCommentToIdea(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        author_id: 'author_id',
        body_multiloc: { en: 'body_multiloc' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(commentData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddCommentToIdea(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        author_id: 'author_id',
        body_multiloc: { en: 'body_multiloc' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
