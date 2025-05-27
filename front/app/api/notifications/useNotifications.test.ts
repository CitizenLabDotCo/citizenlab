import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { notificationsData, links } from './__mocks__/useNotifications';
import useNotifications from './useNotifications';

const apiPath = '*notifications';
const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: notificationsData, links },
      { status: 200 }
    );
  })
);

describe('useNotifications', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly with next page', async () => {
    const { result } = renderHook(
      () =>
        useNotifications({
          pageNumber: 1,
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(notificationsData);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('returns data correctly with no next page', async () => {
    const newLinks = { ...links, next: null };
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(
          { data: notificationsData, links: newLinks },
          { status: 200 }
        );
      })
    );
    const { result } = renderHook(
      () =>
        useNotifications({
          pageNumber: 1,
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.pages[0].data).toEqual(notificationsData);
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
        useNotifications({
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
