import { QueryParameters } from './types';

const categorySuggestionsKeys = {
  all: () => [{ type: 'category_suggestion_task' }],
  tasks: (viewId: string, filters?: QueryParameters) => [
    {
      ...categorySuggestionsKeys.all[0],
      type: 'category_suggestion_task',
      operation: 'item',
      viewId,
      ...filters,
    },
  ],
} as const;

export default categorySuggestionsKeys;
