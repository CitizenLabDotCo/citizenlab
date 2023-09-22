import { Keys } from 'utils/cl-react-query/types';
import { authorsByDomicileKeys, authorsByAgeKeys } from './keys';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

// Authors by Domicile
export type AuthorsByDomicileKeys = Keys<typeof authorsByDomicileKeys>;
export interface IAuthorsByDomicile {
  data: {
    type: 'authors_by_domicile';
    attributes: {
      series: {
        users: {
          [key: string]: number;
        };
      };
    };
  };
}

export type AuthorsByDomicileQueryParams = IInputsFilterParams;

// Authors by age
export type AuthorsByAgeKeys = Keys<typeof authorsByAgeKeys>;
export interface IAuthorsByAge {
  data: {
    type: 'authors_by_age';
    attributes: {
      unknown_age_count: number;
      series: {
        user_counts: number[];
        bins: (number | null)[];
      };
    };
  };
}

export type AuthorsByAgeQueryParams = IInputsFilterParams;
