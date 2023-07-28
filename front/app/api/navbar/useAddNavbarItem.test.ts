import { renderHook, act } from '@testing-library/react-hooks';

import useAddNavbarItem from './useAddNavbarItem';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { navbarItemsData } from './__mocks__/useNavbarItems';

const apiPath = '*nav_bar_items';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: navbarItemsData[0] }));
  })
);

describe('useAddNavbarItem', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddNavbarItem(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        type: 'default_item',
        navbarTitleMultiloc: {
          en: 'test',
        },
        navbarCode: 'home',
        navbarId: '1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(navbarItemsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddNavbarItem(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        type: 'default_item',
        navbarTitleMultiloc: {
          en: 'test',
        },
        navbarCode: 'home',
        navbarId: '1',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
