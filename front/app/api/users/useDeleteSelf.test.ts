import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useDeleteSelf from './useDeleteSelf';

jest.mock('api/me/useAuthUser');

const apiPath = '*users/:id';

const server = setupServer(
  http.delete(apiPath, () => new HttpResponse(null, { status: 200 }))
);

describe('useDeleteSelf', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('deletes the account', async () => {
    const { result } = renderHook(() => useDeleteSelf(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('returns the URL to sign out at the SSO provider', async () => {
    const logoutUrl = 'https://sso.example.com/logout';
    server.use(
      http.delete(apiPath, () =>
        HttpResponse.json({ logout_url: logoutUrl }, { status: 200 })
      )
    );

    const { result } = renderHook(() => useDeleteSelf(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(logoutUrl);
  });

  it('returns an error when deleting fails', async () => {
    server.use(
      http.delete(apiPath, () => HttpResponse.json(null, { status: 500 }))
    );

    const { result } = renderHook(() => useDeleteSelf(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
