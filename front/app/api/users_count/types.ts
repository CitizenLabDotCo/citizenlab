import userUsersCountKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type UserUsersCountKeys = Keys<typeof userUsersCountKeys>;

export interface IUsersCount {
  data: {
    type: 'users_count';
    attributes: {
      count: number;
      administrators_count: number;
      moderators_count: number;
    };
  };
}
