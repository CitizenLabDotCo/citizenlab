import { Keys } from 'utils/cl-react-query/types';
import ideaReactionsKeys from './keys';

export type IdeaReactionsKeys = Keys<typeof ideaReactionsKeys>;

export type TReactionMode = 'up' | 'down';

interface IIdeaReactionData {
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

export interface IIdeaReaction {
  data: IIdeaReactionData;
}

export interface INewReactionProperties {
  ideaId: string;
  userId: string;
  mode: 'up' | 'down';
}
