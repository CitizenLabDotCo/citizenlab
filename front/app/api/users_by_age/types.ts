import { Keys } from 'utils/cl-react-query/types';
import usersByAgeKeys from './keys';

export type UsersByAgeKeys = Keys<typeof usersByAgeKeys>;

export interface ICustomFieldParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  filter_by_participation?: boolean | null;
}

export interface IUsersByAge {
  data: {
    type: 'users_by_age';
    attributes: {
      total_user_count: number;
      unknown_age_count: number;
      series: {
        user_counts: number[];
        expected_user_counts: number[];
        reference_population: number[];
        bins: (number | null)[];
      };
    };
  };
}
