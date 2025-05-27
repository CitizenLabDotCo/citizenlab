import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { mapLayerData } from './__mocks__/mapLayerData';
import useReorderMapLayer from './useReorderMapLayer';

const apiPath = '*/map_configs/:mapConfigId/layers/:id/reorder';

const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: mapLayerData }, { status: 200 });
  })
);

describe('useReorderMapLayer', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useReorderMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
        ordering: 1,
        mapConfigId: 'mapConfigId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(mapLayerData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useReorderMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        id: 'id',
        ordering: 1,
        mapConfigId: 'mapConfigId',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
