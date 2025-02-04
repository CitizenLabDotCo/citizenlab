import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { usersData } from './__mocks__/_mockServer';
import useChangePassword from './useChangePassword';

const apiPath = '*users/update_password';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: usersData[0] }, { status: 200 });
  })
);

describe('useChangePassword', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        current_password: 'old_password',
        password: 'new_password',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(usersData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useChangePassword(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        current_password: 'old_password',
        password: 'new_password',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
