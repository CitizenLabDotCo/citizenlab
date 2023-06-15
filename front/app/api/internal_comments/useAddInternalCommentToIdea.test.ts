import { renderHook, act } from '@testing-library/react-hooks';

import useAddInternalCommentToIdea from './useAddInternalCommentToIdea';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { commentsData } from './__mocks__/useInternalComments';

const apiPath = '*/ideas/:ideaId/internal_comments';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: commentsData[0] }));
  })
);

describe('useAddInternalCommentToIdea', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useAddInternalCommentToIdea(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        author_id: 'author_id',
        body_multiloc: { en: 'body_multiloc' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(commentsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useAddInternalCommentToIdea(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

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
