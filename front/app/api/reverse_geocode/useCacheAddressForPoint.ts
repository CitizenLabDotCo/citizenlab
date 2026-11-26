import { useQueryClient } from '@tanstack/react-query';

import reverseGeocodeKeys from './keys';
import { Params } from './types';

/**
 * Stores an address against its coordinates without asking the API for it.
 *
 * Use it when the address is already known, such as one somebody picked from
 * the suggestions: looking those coordinates up again would answer with the
 * geocoder's own wording of the place and overwrite what they chose.
 */
const useCacheAddressForPoint = () => {
  const queryClient = useQueryClient();

  return ({ lat, lng, language }: Params, address: string) => {
    queryClient.setQueryData(
      reverseGeocodeKeys.item({ lat, lng, language }),
      address
    );
  };
};

export default useCacheAddressForPoint;
