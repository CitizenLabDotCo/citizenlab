import { renderHook } from '@testing-library/react-hooks';

import useInitiativeMarkers from './useInitiativeMarkers';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*initiatives/as_markers';

const initiativeMarkersData = {
  data: [
    {
      id: 'initiativeId',
      type: 'post_marker',
      attributes: {
        title_multiloc: {
          en: 'Initiative title',
        },
        location_point_geojson: {
          type: 'Point',
          coordinates: [0, 0],
        },
        location_description: 'Location description',
      },
    },
  ],
};

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: initiativeMarkersData }));
  })
);

describe('useInitiativeMarkers', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useInitiativeMarkers(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(initiativeMarkersData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useInitiativeMarkers(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
