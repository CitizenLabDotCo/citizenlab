import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { makeUser } from 'api/users/__mocks__/useUsers';
import { IUser } from 'api/users/types';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useUnblockUser from './useUnblockUser';

export const userData: IUser = makeUser();

const apiPath = '*users/:id/unblock';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: userData }, { status: 200 });
  })
);

describe('useUnblockUser', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUnblockUser(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('id');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUnblockUser(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate('id');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
