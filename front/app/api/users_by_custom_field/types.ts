import { Keys } from 'utils/cl-react-query/types';
import usersByCustomFieldKeys from './keys';
import { Multiloc } from 'typings';

export type UsersByCustomFieldKeys = Keys<typeof usersByCustomFieldKeys>;

export interface ICustomFieldParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  filter_by_participation?: boolean | null;
}

export interface IUsersByCustomField {
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
      };
      // Not used for gender and age
      options: {
        [key: string]: {
          title_multiloc: Multiloc;
          ordering: number;
        };
      };
    };
  };
}
