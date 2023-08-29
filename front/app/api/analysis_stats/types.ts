import { Keys } from 'utils/cl-react-query/types';
import authorsByDomicileKeys from './keys';
import { Multiloc } from 'typings';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

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
      areas: {
        [key: string]: {
          title_multiloc: Multiloc;
          ordering: number;
        };
      };
    };
  };
}

export type AuthorsByDomicileQueryParams = IInputsFilterParams;
