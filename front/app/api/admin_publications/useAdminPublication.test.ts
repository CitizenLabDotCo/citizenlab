import { renderHook } from '@testing-library/react-hooks';

import useAdminPublication from './useAdminPublication';
import { mockFolderChildAdminPublicationsList } from './__mocks__/useAdminPublications';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*admin_publications/:id';

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: mockFolderChildAdminPublicationsList[0] })
    );
  })
);

describe('useAdminPublication', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAdminPublication('id'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(
      mockFolderChildAdminPublicationsList[0]
    );
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAdminPublication('id'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
