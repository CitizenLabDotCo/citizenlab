import { Keys } from 'utils/cl-react-query/types';

import blockedUsersCountKeys from './keys';

export type BlockedUsersCountKeys = Keys<typeof blockedUsersCountKeys>;

export interface IBlockedUsersCount {
  data: IBlockedUsersCountData;
}

export interface IBlockedUsersCountData {
  type: 'blocked_users_count';
  attributes: {
    count: number;
  };
}

export interface IBlockUser {
  userId: string;
  reason: string;
}
