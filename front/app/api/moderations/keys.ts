import { QueryKeys } from 'utils/cl-react-query/types';
import { InputParameters } from './types';

const baseKey = { type: 'moderation' };

const moderationsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: InputParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default moderationsKeys;
