import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { usersData } from './__mocks__/_mockServer';
import useUpdateUser from './useUpdateUser';

const apiPath = '*users/:id';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: usersData[0] }, { status: 200 });
  })
);

describe('useUpdateUser', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        userId: 'id',
        first_name: 'Name',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(usersData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        userId: 'id',
        first_name: 'Name',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
