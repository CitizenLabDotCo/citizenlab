import { Keys } from 'utils/cl-react-query/types';
import ideaVotesKeys from './keys';

export type IdeaVotesKeys = Keys<typeof ideaVotesKeys>;

export type TVoteMode = 'up' | 'down';

interface IIdeaVoteData {
  id: string;
  type: 'vote';
  attributes: {
    mode: TVoteMode;
  };
  relationships: {
    votable: {
      data: {
        id: string;
        type: 'votable';
      };
    };
    user: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}

export interface IIdeaVote {
  data: IIdeaVoteData;
}

export interface INewVoteProperties {
  ideaId: string;
  userId: string;
  mode: 'up' | 'down';
}
