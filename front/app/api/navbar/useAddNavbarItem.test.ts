import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { navbarItemsData } from './__mocks__/useNavbarItems';
import useAddNavbarItem from './useAddNavbarItem';

const apiPath = '*nav_bar_items';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: navbarItemsData[0] }, { status: 200 });
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
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
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
