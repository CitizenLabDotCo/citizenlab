import { QueryKeys } from 'utils/cl-react-query/types';
import { QueryParams } from './types';

const baseKey = {
  type: 'imported_idea',
};

const importedIdeaKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: QueryParams) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default importedIdeaKeys;
