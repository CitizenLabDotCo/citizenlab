import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { followersData } from './__mocks__/useFollowers';
import useAddFollower from './useAddFollower';

const apiPath = '*followers';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: followersData[0] }, { status: 200 });
  })
);

describe('useAddFollower', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddFollower(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        followableType: 'ideas',
        followableId: '1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(followersData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddFollower(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        followableType: 'ideas',
        followableId: '1',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
