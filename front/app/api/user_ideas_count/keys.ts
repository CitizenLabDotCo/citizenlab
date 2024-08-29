import { QueryKeys } from 'utils/cl-react-query/types';

import { IParameters } from './types';

const baseKey = {
  type: 'user_ideas_count',
};

const userIdeasCountKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: IParameters) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default userIdeasCountKeys;
