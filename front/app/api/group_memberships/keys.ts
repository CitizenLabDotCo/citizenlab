import { QueryKeys } from 'utils/cl-react-query/types';
import { IParameters } from './types';

const baseKey = { type: 'membership' };

const membershipsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default membershipsKeys;
