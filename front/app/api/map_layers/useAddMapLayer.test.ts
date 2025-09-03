import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { mapLayerData } from './__mocks__/mapLayerData';
import useAddMapLayer from './useAddMapLayer';

const apiPath = `*/map_configs/:mapConfigId/layers`;

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: mapLayerData }, { status: 200 });
  })
);

describe('useAddMapLayer', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        type: 'CustomMaps::GeojsonLayer',
        mapConfigId: '1',
        id: 'id',
        title_multiloc: {
          en: 'test',
        },
        default_enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(mapLayerData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        type: 'CustomMaps::GeojsonLayer',
        mapConfigId: '1',
        id: 'id',
        title_multiloc: {
          en: 'test',
        },
        default_enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
