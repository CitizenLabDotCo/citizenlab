import categorySuggestionKeys from './queryKeys';

export type categorySuggestionKeys = ReturnType<
  typeof categorySuggestionKeys[keyof typeof categorySuggestionKeys]
>;

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
