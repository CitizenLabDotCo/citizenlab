import { Keys } from 'utils/cl-react-query/types';

import emailBouncedUsersCountKeys from './keys';

export type EmailBouncedUsersCountKeys = Keys<
  typeof emailBouncedUsersCountKeys
>;

export interface IEmailBouncedUsersCount {
  data: IEmailBouncedUsersCountData;
}

export interface IEmailBouncedUsersCountData {
  type: 'email_bounced_users_count';
  attributes: {
    count: number;
  };
}
