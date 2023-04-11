import { renderHook } from '@testing-library/react-hooks';

import useComments from './useComments';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { commentsData, links } from './__mocks__/useComments';

const ideaPath = '*ideas/:ideaId/comments';
const initiativePath = '*initiatives/:initiativeId/comments';
const childrenPath = '*comments/:commentId/children';
const userPath = '*users/:userId/comments';

const server = setupServer();

describe('useComments', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly with ideaId', async () => {
    server.use(
      rest.get(ideaPath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: commentsData, links }));
      })
    );
    const { result, waitFor } = renderHook(
      () => useComments({ ideaId: 'ideaId' }),
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
      () => useComments({ initiativeId: 'initiativeId' }),
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
      () => useComments({ userId: 'userId' }),
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
      () => useComments({ commentId: 'commentId' }),
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
      () => useComments({ ideaId: 'ideaId' }),
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
