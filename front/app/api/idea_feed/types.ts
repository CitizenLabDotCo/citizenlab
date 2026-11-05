import { IIdeaData } from 'api/ideas/types';

import { Keys } from 'utils/cl-react-query/types';

import ideaFeedKeys from './keys';

export type IdeaFeedKeys = Keys<typeof ideaFeedKeys>;

export interface IIdeaFeedQueryParameters {
  'page[size]'?: number;
  topic?: string;
}

export interface IIdeaFeedIdeas {
  data: IIdeaData[];
}
