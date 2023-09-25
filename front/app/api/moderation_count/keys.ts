import { QueryKeys } from 'utils/cl-react-query/types';
import { InputParameters } from '../moderations/types';

const baseKey = { type: 'moderations_count' };

const moderationsCountKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: InputParameters) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default moderationsCountKeys;
