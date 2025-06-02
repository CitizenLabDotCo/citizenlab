import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { commentsData, links } from './__mocks__/useComments';
import useComments from './useComments';

const ideaPath = '*ideas/:ideaId/comments';
const childrenPath = '*comments/:commentId/children';
const userPath = '*users/:userId/comments';

const server = setupServer();

describe('useComments', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly with ideaId', async () => {
    server.use(
      http.get(ideaPath, () => {
        return HttpResponse.json(
          { data: commentsData, links },
          { status: 200 }
        );
      })
    );
    const { result } = renderHook(() => useComments({ ideaId: 'ideaId' }), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(commentsData);
  });

  it('returns data correctly with userId', async () => {
    server.use(
      http.get(userPath, () => {
        return HttpResponse.json(
          { data: commentsData, links },
          { status: 200 }
        );
      })
    );
    const { result } = renderHook(() => useComments({ authorId: 'userId' }), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(commentsData);
  });

  it('returns data correctly with parentId', async () => {
    server.use(
      http.get(childrenPath, () => {
        return HttpResponse.json(
          { data: commentsData, links },
          { status: 200 }
        );
      })
    );
    const { result } = renderHook(
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
      http.get(ideaPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useComments({ ideaId: 'ideaId' }), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
