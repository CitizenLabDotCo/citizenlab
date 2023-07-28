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

export interface IBasketsIdeas {
  data: IBasketsIdeaData[];
}

export interface IBasketsIdea {
  data: IBasketsIdeaData;
}
