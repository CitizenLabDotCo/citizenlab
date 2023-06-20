import { Keys } from 'utils/cl-react-query/types';
import usersByGenderKeys from './keys';
import { Multiloc } from 'typings';

export type UsersByGenderKeys = Keys<typeof usersByGenderKeys>;

export interface ICustomFieldParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  filter_by_participation?: boolean | null;
}

export interface IUsersByRegistrationField {
  data: {
    type: 'users_by_custom_field';
    attributes: {
      series: {
        users: {
          [key: string]: number;
        };
        reference_population: {
          [key: string]: number;
        } | null;
        expected_users: {
          [key: string]: number;
        } | null;
      };
      options: {
        [key: string]: {
          title_multiloc: Multiloc;
          ordering: number;
        };
      };
    };
  };
}
