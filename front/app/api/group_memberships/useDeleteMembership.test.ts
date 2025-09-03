import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useDeleteMembership from './useDeleteMembership';

const apiPath = '*groups/:groupId/memberships/by_user_id/:userId';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDeleteMembership', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useDeleteMembership(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ groupId: '1', userId: '2' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
  it('returns error correctly', async () => {
    server.use(
      http.delete(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDeleteMembership(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ groupId: '1', userId: '2' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
