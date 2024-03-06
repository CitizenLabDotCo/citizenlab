import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { commentsData, links } from './__mocks__/useInternalComments';
import useInternalComments from './useInternalComments';

const ideaPath = '*ideas/:ideaId/internal_comments';
const initiativePath = '*initiatives/:initiativeId/internal_comments';
const childrenPath = '*internal_comments/:commentId/children';
const userPath = '*users/:userId/internal_comments';

const server = setupServer();

describe('useInternalComments', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly with ideaId', async () => {
    server.use(
      rest.get(ideaPath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: commentsData, links }));
      })
    );
    const { result, waitFor } = renderHook(
      () => useInternalComments({ type: 'idea', ideaId: 'ideaId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(commentsData);
  });

  it('returns data correctly with initiativeId', async () => {
    server.use(
      rest.get(initiativePath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: commentsData, links }));
      })
    );
    const { result, waitFor } = renderHook(
      () =>
        useInternalComments({
          type: 'initiative',
          initiativeId: 'initiativeId',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(commentsData);
  });

  it('returns data correctly with userId', async () => {
    server.use(
      rest.get(userPath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: commentsData, links }));
      })
    );
    const { result, waitFor } = renderHook(
      () => useInternalComments({ type: 'author', authorId: 'authorId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(commentsData);
  });

  it('returns data correctly with parentId', async () => {
    server.use(
      rest.get(childrenPath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: commentsData, links }));
      })
    );
    const { result, waitFor } = renderHook(
      () => useInternalComments({ type: 'comment', commentId: 'commentId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(commentsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(ideaPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useInternalComments({ type: 'idea', ideaId: 'ideaId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
