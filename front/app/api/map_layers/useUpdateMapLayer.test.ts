import { renderHook, act } from '@testing-library/react-hooks';

import useUpdateMapLayer from './useUpdateMapLayer';
import { mapLayerData } from './__mocks__/mapLayerData';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*projects/:projectId/map_config/layers/:id';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mapLayerData }));
  })
);

describe('useUpdateMapLayer', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
        projectId: 'projectId',
        title_multiloc: { en: 'name' },
        geojson: { type: 'FeatureCollection', features: [] },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(mapLayerData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
        projectId: 'projectId',
        title_multiloc: { en: 'name' },
        geojson: { type: 'FeatureCollection', features: [] },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
