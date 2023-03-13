import { Keys } from 'utils/cl-react-query/types';
import voteKeys from './keys';

export type VoteKeys = Keys<typeof voteKeys>;

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
  user_id?: string;
  mode: 'up' | 'down';
}
