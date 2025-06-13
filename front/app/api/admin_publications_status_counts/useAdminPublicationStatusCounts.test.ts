import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useAdminPublicationsStatusCounts from './useAdminPublicationsStatusCounts';

const apiPath = '*/admin_publications/status_counts';

const countData = {
  data: {
    type: 'status_counts',
    attributes: {
      published: 5,
    },
  },
};
const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: countData }, { status: 200 });
  })
);

describe('useAdminPublicationsStatusCounts', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useAdminPublicationsStatusCounts({}), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(countData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAdminPublicationsStatusCounts({}), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
