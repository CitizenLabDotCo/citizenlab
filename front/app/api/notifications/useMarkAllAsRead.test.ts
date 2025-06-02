import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useMarkAllAsRead from './useMarkAllAsRead';

const apiPath = '*notifications/mark_all_read';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useMarkAllAsRead', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useMarkAllAsRead(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useMarkAllAsRead(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
