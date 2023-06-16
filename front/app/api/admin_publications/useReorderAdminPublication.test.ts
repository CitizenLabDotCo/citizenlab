import { renderHook, act } from '@testing-library/react-hooks';

import useReorderAdminPublication from './useReorderAdminPublication';
import { mockFolderChildAdminPublicationsList } from './__mocks__/useAdminPublications';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*admin_publications/:id/reorder';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: mockFolderChildAdminPublicationsList[0] })
    );
  })
);

describe('useReorderAdminPublication', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useReorderAdminPublication(), {
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
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useReorderAdminPublication(), {
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
