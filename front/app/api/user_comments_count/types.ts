import { Keys } from 'utils/cl-react-query/types';

import userCommentsCountKeys from './keys';

export type UserCommentsCountKeys = Keys<typeof userCommentsCountKeys>;

export type IParameters = {
  userId?: string;
};

export interface ICommentsCount {
  data: {
    type: 'comments_count';
    attributes: {
      count: number;
    };
  };
}
