import { Keys } from 'utils/cl-react-query/types';

import usersByAgeKeys from './keys';

export type UsersByAgeKeys = Keys<typeof usersByAgeKeys>;

export interface IUsersByAge {
  data: {
    type: 'users_by_age';
    attributes: {
      total_user_count: number;
      unknown_age_count: number;
      series: {
        user_counts: number[];
        reference_population: number[];
        bins: (number | null)[];
      };
    };
  };
}
