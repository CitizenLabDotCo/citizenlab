import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useAddMembership from './useAddMembership';
import { membershipsData } from './useMemberships.test';

const apiPath = '*groups/:groupId/memberships';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: membershipsData[0] }, { status: 200 });
  })
);

describe('useAddMembership', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddMembership(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        groupId: '1',
        userId: '2',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(membershipsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddMembership(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        groupId: '1',
        userId: '2',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
