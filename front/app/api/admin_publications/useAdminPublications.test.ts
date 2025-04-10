import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import {
  mockFolderChildAdminPublicationsList,
  links,
} from './__mocks__/useAdminPublications';
import useAdminPublications from './useAdminPublications';

const apiPath = '*admin_publications';
const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: mockFolderChildAdminPublicationsList, links },
      { status: 200 }
    );
  })
);

describe('useAdminPublications', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly with next page', async () => {
    const { result } = renderHook(
      () =>
        useAdminPublications({
          pageNumber: 1,
          search: '',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(
      mockFolderChildAdminPublicationsList
    );
    expect(result.current.hasNextPage).toBe(true);
  });

  it('returns data correctly with no next page', async () => {
    const newLinks = { ...links, next: null };
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(
          {
            data: mockFolderChildAdminPublicationsList,
            links: newLinks,
          },
          { status: 200 }
        );
      })
    );
    const { result } = renderHook(
      () =>
        useAdminPublications({
          pageNumber: 1,
          search: '',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(
      mockFolderChildAdminPublicationsList
    );
    expect(result.current.hasNextPage).toBe(false);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useAdminPublications({
          pageNumber: 1,
          search: '',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
