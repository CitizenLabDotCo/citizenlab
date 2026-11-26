import { useQueries } from '@tanstack/react-query';

import { NO_PLACEHOLDER_DATA } from 'utils/cl-react-query/queryClient';
import { reverseGeocode } from 'utils/locationTools';

import reverseGeocodeKeys from './keys';
import { Params } from './types';

// reverseGeocode reports both "no address found" and a failed lookup as
// undefined, which React Query treats as a bug, so an unresolved address
// travels as null instead.
const fetchAddress = async ({ lat, lng, language }: Params) =>
  (await reverseGeocode(lat, lng, language)) ?? null;

/**
 * Resolves the address of each [lng, lat] pair, in the order given.
 *
 * Every coordinate is its own query, so adding, moving or removing one only
 * looks up the coordinate that changed; the rest are served from the cache.
 */
const useReverseGeocodedAddresses = (
  coordinates: number[][],
  language: string
) => {
  const queries = coordinates.map(([lng, lat]) => ({
    queryKey: reverseGeocodeKeys.item({ lat, lng, language }),
    queryFn: () => fetchAddress({ lat, lng, language }),
    // A moved pin would otherwise keep showing the address of where it was,
    // which claims it sits somewhere it does not.
    placeholderData: NO_PLACEHOLDER_DATA,
  }));

  return useQueries({ queries }).map((result) => ({
    address: result.data ?? undefined,
    isLoading: result.isLoading,
  }));
};

export default useReverseGeocodedAddresses;
