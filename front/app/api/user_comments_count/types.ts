import userCommentsCountKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

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
