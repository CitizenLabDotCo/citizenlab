import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { act, renderHook, waitFor } from 'utils/testUtils/rtl';

import useCacheAddressForPoint from './useCacheAddressForPoint';
import useReverseGeocodedAddresses from './useReverseGeocodedAddresses';

const apiPath = '*/location/reverse_geocode';

const PARK_LANE = [4.35, 50.85];
const HARBOUR_ROAD = [4.36, 50.86];

let requestedCoordinates: string[] = [];

const server = setupServer(
  http.get(apiPath, ({ request }) => {
    const url = new URL(request.url);
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    requestedCoordinates.push(`${lng},${lat}`);

    return HttpResponse.json({
      data: {
        type: 'reverse_geocode',
        attributes: { formatted_address: `Address of ${lng},${lat}` },
      },
    });
  })
);

describe('useReverseGeocodedAddresses', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  beforeEach(() => {
    requestedCoordinates = [];
  });

  it('returns one address per coordinate, in the order given', async () => {
    const { result } = renderHook(
      () => useReverseGeocodedAddresses([PARK_LANE, HARBOUR_ROAD], 'en'),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() =>
      expect(result.current.every(({ isLoading }) => !isLoading)).toBe(true)
    );

    expect(result.current.map(({ address }) => address)).toEqual([
      'Address of 4.35,50.85',
      'Address of 4.36,50.86',
    ]);
  });

  it('asks once for a coordinate that appears twice', async () => {
    const { result } = renderHook(
      () => useReverseGeocodedAddresses([PARK_LANE, PARK_LANE], 'en'),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() =>
      expect(result.current.every(({ isLoading }) => !isLoading)).toBe(true)
    );

    expect(requestedCoordinates).toEqual(['4.35,50.85']);
    // Two pins on the same spot still get a row each, so the results have to
    // stay aligned with the coordinates that were passed in.
    expect(result.current.map(({ address }) => address)).toEqual([
      'Address of 4.35,50.85',
      'Address of 4.35,50.85',
    ]);
  });

  it('only looks up the new coordinate when a pin is added', async () => {
    const { result, rerender } = renderHook(
      ({ coordinates }) => useReverseGeocodedAddresses(coordinates, 'en'),
      {
        wrapper: createQueryClientWrapper(),
        initialProps: { coordinates: [PARK_LANE] },
      }
    );

    await waitFor(() => expect(result.current[0].isLoading).toBe(false));
    expect(requestedCoordinates).toEqual(['4.35,50.85']);

    rerender({ coordinates: [PARK_LANE, HARBOUR_ROAD] });

    await waitFor(() => expect(result.current[1].isLoading).toBe(false));

    expect(requestedCoordinates).toEqual(['4.35,50.85', '4.36,50.86']);
    expect(result.current[0].address).toBe('Address of 4.35,50.85');
  });

  it('serves an address cached for a coordinate without asking the API', async () => {
    const wrapper = createQueryClientWrapper();

    const { result: cache } = renderHook(() => useCacheAddressForPoint(), {
      wrapper,
    });

    // The address somebody picked from the suggestions is already known, so
    // looking it up would only answer with the geocoder's own wording of it.
    act(() => {
      cache.current(
        { lat: PARK_LANE[1], lng: PARK_LANE[0], language: 'en' },
        '12 Park Lane, Westmere'
      );
    });

    const { result } = renderHook(
      () => useReverseGeocodedAddresses([PARK_LANE], 'en'),
      { wrapper }
    );

    // Shown straight away, with no lookup to wait for and nothing to
    // overwrite it.
    expect(result.current[0].address).toBe('12 Park Lane, Westmere');
    expect(result.current[0].isLoading).toBe(false);
  });

  it('reports no address when the lookup fails', async () => {
    server.use(
      http.get(apiPath, () => HttpResponse.json(null, { status: 500 }))
    );

    const { result } = renderHook(
      () => useReverseGeocodedAddresses([PARK_LANE], 'en'),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current[0].isLoading).toBe(false));

    expect(result.current[0].address).toBeUndefined();
  });
});
