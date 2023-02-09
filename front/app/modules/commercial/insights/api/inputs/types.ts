import { IRelationship } from 'typings';
import inputKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type InputsKeys = Keys<typeof inputKeys>;

export type QueryParameters = {
  category: string;
  pageSize?: number;
  pageNumber: number;
  search: string;
  processed?: boolean;
  sort?: 'approval' | '-approval';
};

export type InfiniteQueryParameters = {
  pageSize?: number;
  pageNumber?: number;
  search?: string;
  categories: string[];
  keywords: string[];
};

export interface IInsightsInput {
  data: IInsightsInputData;
}

export interface IInsightsInputData {
  id: string;
  type: string;
  relationships: {
    categories: { data: IRelationship[] };
    suggested_categories: { data: IRelationship[] };
    source: {
      data: IRelationship;
    };
  };
}

export interface IInsightsInputLinks {
  self: string;
  first: string;
  prev: string | null;
  next: string | null;
  last: string;
}

export interface IInsightsInputs {
  data: IInsightsInputData[];
  links: IInsightsInputLinks;
}
