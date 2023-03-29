import { QueryKeys } from 'utils/cl-react-query/types';
import { QueryParameters } from './types';

const baseKey = {
  type: 'category_suggestion_task',
};
const categorySuggestionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({
    viewId,
    filters,
  }: {
    viewId: string;
    filters?: QueryParameters;
  }) => [
    {
      ...baseKey,
      type: 'category_suggestion_task',
      operation: 'list',
      parameters: { viewId, ...filters },
    },
  ],
} satisfies QueryKeys;

export default categorySuggestionsKeys;
