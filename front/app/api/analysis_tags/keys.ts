import { QueryKeys } from 'utils/cl-react-query/types';
import { ITagParams } from './types';

const baseKey = { type: 'tag' };

const tagsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: ITagParams) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default tagsKeys;
