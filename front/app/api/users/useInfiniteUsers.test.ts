import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { usersData } from './__mocks__/_mockServer';
import useInfiniteUsers from './useInfiniteUsers';

export const links = {
  last: 'http://localhost:3000/web_api/v1/users?page%5Bnumber%5D=9&page%5Bsize%5D=12&sort=random',
  next: 'http://localhost:3000/web_api/v1/users?page%5Bnumber%5D=2&page%5Bsize%5D=12&sort=random',
  self: 'http://localhost:3000/web_api/v1/users?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  first:
    'http://localhost:3000/web_api/v1/users?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  prev: null,
};

const apiPath = '*users';
const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: usersData, links }, { status: 200 });
  })
);

describe('useInfiniteUsers', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly with next page', async () => {
    const { result } = renderHook(
      () =>
        useInfiniteUsers({
          pageNumber: 1,
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(usersData);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('returns data correctly with no next page', async () => {
    const newLinks = { ...links, next: null };
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(
          { data: usersData, links: newLinks },
          { status: 200 }
        );
      })
    );
    const { result } = renderHook(
      () =>
        useInfiniteUsers({
          pageNumber: 1,
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(usersData);
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
        useInfiniteUsers({
          pageNumber: 1,
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
