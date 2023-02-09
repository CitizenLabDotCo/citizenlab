import categorySuggestionsKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type CategorySuggestionsKeys = Keys<typeof categorySuggestionsKeys>;

export type QueryParameters = {
  categories: string[];
  processed?: boolean;
};

export type ScanStatus = 'isIdle' | 'isScanning' | 'isFinished' | 'isError';

export interface IInsightsCategorySuggestionsTasks {
  data: {
    type: 'categories_suggestions_task_count';
    count: number;
    initialCount: number;
    status: ScanStatus;
  };
}
