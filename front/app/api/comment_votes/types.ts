import { Keys } from 'utils/cl-react-query/types';
import commentVotesKeys from './keys';

export type CommentVotesKeys = Keys<typeof commentVotesKeys>;

export type TVoteMode = 'up' | 'down';

interface ICommentVoteData {
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

export interface ICommentVote {
  data: ICommentVoteData;
}

export interface INewVoteProperties {
  commentId: string;
  userId: string;
  mode: 'up' | 'down';
}
