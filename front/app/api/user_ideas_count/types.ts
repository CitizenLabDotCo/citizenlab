import { Keys } from 'utils/cl-react-query/types';

import userIdeaCountKeys from './keys';

export type UserIdeaCountKeys = Keys<typeof userIdeaCountKeys>;

export type IParameters = {
  userId?: string;
};

export interface IIdeaCount {
  data: {
    type: 'ideas_count';
    attributes: {
      count: number;
    };
  };
}
