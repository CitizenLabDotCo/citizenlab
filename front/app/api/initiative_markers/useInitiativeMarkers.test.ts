import { renderHook } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useInitiativeMarkers from './useInitiativeMarkers';

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
  http.get(apiPath, () => {
    return HttpResponse.json({ data: initiativeMarkersData }, { status: 200 });
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
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
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
