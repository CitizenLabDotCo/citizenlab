import { Multiloc } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import similarIdeasKeys from './keys';

export type SimilarIdeasKeys = Keys<typeof similarIdeasKeys>;

export interface IMinimalIdeaData {
  id: string;
  type: string;
  attributes: {
    slug: string;
    title_multiloc: Multiloc;
  };
}

export type SimilarIdeas = {
  data: IMinimalIdeaData[];
};

export interface IQueryParameters {
  ideaId: string;
  pageSize?: number;
}
