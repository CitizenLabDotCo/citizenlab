import { Keys } from 'utils/cl-react-query/types';
import commentReactionsKeys from './keys';

export type CommentReactionsKeys = Keys<typeof commentReactionsKeys>;

export type TReactionMode = 'up' | 'down';

interface ICommentReactionData {
  id: string;
  type: 'reaction';
  attributes: {
    mode: TReactionMode;
  };
  relationships: {
    reactable: {
      data: {
        id: string;
        type: 'reactable';
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

export interface ICommentReaction {
  data: ICommentReactionData;
}

export interface INewReactionProperties {
  commentId: string;
  userId: string;
  mode: 'up' | 'down';
}
