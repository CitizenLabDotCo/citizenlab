import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { navbarItemsData } from './__mocks__/useNavbarItems';
import { NavbarParameters } from './types';
import useNavbarItems from './useNavbarItems';

const apiPath = '*/nav_bar_items';

const params: NavbarParameters = {
  onlyDefaultItems: false,
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: navbarItemsData }, { status: 200 });
  })
);

describe('useNavbarItems', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useNavbarItems(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(navbarItemsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useNavbarItems(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('calls correct endpoint for removed default items', async () => {
    server.use(
      http.get(`${apiPath}/removed_default_items`, () => {
        return HttpResponse.json({ data: navbarItemsData }, { status: 200 });
      })
    );
    const { result } = renderHook(
      () => useNavbarItems({ onlyRemovedDefaultItems: true }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(navbarItemsData);
  });
});
