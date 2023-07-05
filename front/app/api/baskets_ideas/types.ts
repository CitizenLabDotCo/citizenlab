import { Keys } from 'utils/cl-react-query/types';
import basketsIdeasKeys from './keys';

export type BasketsIdeasKeys = Keys<typeof basketsIdeasKeys>;

export interface IBasketsIdeaData {
  id: string;
  type: string;
  attributes: {
    votes: number;
  };
  relationships: {
    idea: {
      data: {
        id: string;
        type: 'idea';
      };
    };
    basket: {
      data: {
        id: string;
        type: 'basket';
      };
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
  basketIdeaId: string;
  votes: number;
}

export interface IDeleteBasketsIdea {
  basketId: string;
  basketIdeaId: string;
}
