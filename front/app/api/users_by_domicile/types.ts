import { Keys } from 'utils/cl-react-query/types';
import usersByDomicileKeys from './keys';
import { Multiloc } from 'typings';

export type UsersByDomicileKeys = Keys<typeof usersByDomicileKeys>;

export interface ICustomFieldParams {
  start_at?: string | null;
  end_at?: string | null;
  group?: string;
  project?: string;
  filter_by_participation?: boolean | null;
}

export interface IUsersByDomicile {
  data: {
    type: 'users_by_domicile';
    attributes: {
      series: {
        users: {
          [key: string]: number;
        };
        // reference_population: {
        //   [key: string]: number;
        // }
        // expected_users: {
        //   [key: string]: number;
        // };
      };
      areas: {
        [key: string]: {
          title_multiloc: Multiloc;
          ordering: number;
        };
      };
    };
  };
}
