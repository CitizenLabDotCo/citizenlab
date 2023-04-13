import blockedUsersCountKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

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
