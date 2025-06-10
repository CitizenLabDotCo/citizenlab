import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useRemoveInappropriateContentFlag from './useRemoveInappropriateContentFlag';
const apiPath = '*inappropriate_content_flags/:id/mark_as_deleted';

const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json(null, { status: 202 });
  })
);

describe('useRemoveInappropriateContentFlag', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useRemoveInappropriateContentFlag(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('id');
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useRemoveInappropriateContentFlag(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('id');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
