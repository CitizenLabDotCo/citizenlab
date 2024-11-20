import { IIdeasFilterCounts } from 'api/ideas_filter_counts/types';

export type FilterCounts =
  | IIdeasFilterCounts['data']['attributes']
  | null
  | undefined;
