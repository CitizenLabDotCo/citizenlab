import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useUserCommentsCount from './useUserCommentsCount';

const apiPath = '*/users/:userId/comments_count';

const statData = {
  data: {
    type: 'comments_count',
    attributes: {
      count: 5,
    },
  },
};
const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: statData }, { status: 200 });
  })
);

describe('useUserCommentsCount', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () => useUserCommentsCount({ userId: 'userId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(statData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useUserCommentsCount({ userId: 'userId' }),
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
