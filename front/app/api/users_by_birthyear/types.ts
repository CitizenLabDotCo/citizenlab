import { Keys } from 'utils/cl-react-query/types';
import usersByBirthyearKeys from './keys';

export type UsersByBirthyearKeys = Keys<typeof usersByBirthyearKeys>;

export interface ICustomFieldParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  filter_by_participation?: boolean | null;
}
export interface IUsersByBirthyear {
  data: {
    type: 'users_by_birthyear';
    attributes: {
      series: {
        users: {
          [key: string]: number;
        };
      };
    };
  };
}
