import { Keys } from 'utils/cl-react-query/types';

import userUsersCountKeys from './keys';

export type UserUsersCountKeys = Keys<typeof userUsersCountKeys>;

export interface IUsersCount {
  data: {
    type: 'users_count';
    attributes: {
      count: number;
      administrators_count: number;
      folder_moderators_count: number;
      project_moderators_count: number;
    };
  };
}
