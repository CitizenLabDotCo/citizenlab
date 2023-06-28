import { Keys } from 'utils/cl-react-query/types';
import usersByBirthyearKeys from './keys';

export type UsersByBirthyearKeys = Keys<typeof usersByBirthyearKeys>;

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
