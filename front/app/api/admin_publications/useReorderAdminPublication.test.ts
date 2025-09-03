import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, act, waitFor } from 'utils/testUtils/rtl';

import { mockFolderChildAdminPublicationsList } from './__mocks__/useAdminPublications';
import useReorderAdminPublication from './useReorderAdminPublication';

const apiPath = '*admin_publications/:id/reorder';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json(
      { data: mockFolderChildAdminPublicationsList[0] },
      { status: 200 }
    );
  })
);

describe('useReorderAdminPublication', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useReorderAdminPublication(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
        ordering: 1,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(
      mockFolderChildAdminPublicationsList[0]
    );
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useReorderAdminPublication(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        id: 'id',
        ordering: 1,
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
