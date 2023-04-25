import { QueryKeys } from 'utils/cl-react-query/types';
import { IParameters } from './types';

const baseKey = {
  type: 'comments_count',
};

const userCommentsCountKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: IParameters) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default userCommentsCountKeys;
