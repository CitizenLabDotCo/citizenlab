import userIdeaCountKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

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
