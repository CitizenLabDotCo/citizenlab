import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { navbarItemsData } from './__mocks__/useNavbarItems';
import { NavbarParameters } from './types';
import useNavbarItems from './useNavbarItems';

const apiPath = '*/nav_bar_items';

const params: NavbarParameters = {
  onlyDefaultItems: false,
};

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: navbarItemsData }));
  })
);

describe('useNavbarItems', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useNavbarItems(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(navbarItemsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useNavbarItems(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('calls correct endpoint for removed default items', async () => {
    server.use(
      rest.get(`${apiPath}/removed_default_items`, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: navbarItemsData }));
      })
    );
    const { result, waitFor } = renderHook(
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
