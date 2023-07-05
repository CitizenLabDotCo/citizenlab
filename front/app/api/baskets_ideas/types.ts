import { Keys } from 'utils/cl-react-query/types';
import basketsIdeasKeys from './keys';
import { IRelationship } from 'typings';

export type BasketsIdeasKeys = Keys<typeof basketsIdeasKeys>;

export interface IBasketsIdeaData {
  id: string;
  type: string;
  attributes: {
    votes: number;
  };
  relationships: {
    idea: {
      data: IRelationship[];
    };
  };
}

export interface IBasketsIdea {
  data: IBasketsIdeaData;
}
export interface IBasketsIdeasData {
  data: IBasketsIdeaData[];
}

export interface IBasketsIdeas {
  data: IBasketsIdeaData[];
}

export interface IAddBasketsIdea {
  basketId: string;
  idea_id: string;
  votes?: number;
}
export interface IUpdateBasketsIdea {
  basketId: string;
  basketsIdeaId: string;
  votes: number;
}

export interface IDeleteBasketsIdea {
  basketId: string;
  basketIdeaId: string;
}
