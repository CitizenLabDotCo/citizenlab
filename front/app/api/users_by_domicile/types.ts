import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import usersByDomicileKeys from './keys';

export type UsersByDomicileKeys = Keys<typeof usersByDomicileKeys>;

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
