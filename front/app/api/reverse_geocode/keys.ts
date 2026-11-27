import { QueryKeys } from 'utils/cl-react-query/types';

import { Params } from './types';

const baseKey = {
  type: 'reverse_geocode',
};

const reverseGeocodeKeys = {
  all: () => [baseKey],
  item: (parameters: Params) => [{ ...baseKey, operation: 'item', parameters }],
} satisfies QueryKeys;

export default reverseGeocodeKeys;
