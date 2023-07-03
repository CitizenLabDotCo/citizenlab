import { Keys } from 'utils/cl-react-query/types';
import basketsIdeasKeys from './keys';

export type BasketsIdeasKeys = Keys<typeof basketsIdeasKeys>;

export interface IBasketsIdeaData {
  id: string;
  type: string;
  idea_id: string;
  votes: number;
}

export interface IBasketsIdeasData {
  data: IBasketsIdeaData[];
}

export interface IBasketsIdeas {
  data: IBasketsIdeaData[];
}

export interface IUpdateBasketsIdea {
  votes: number;
}

export interface IAddBasketsIdea {
  idea_id: string;
  votes: number;
}
