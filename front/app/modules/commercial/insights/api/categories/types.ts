import { IRelationship } from 'typings';
import categoriesKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type CategoriesKeys = Keys<typeof categoriesKeys>;

export interface IInsightsCategoryData {
  id: string;
  type: string;
  attributes: {
    name: string;
    inputs_count: number;
  };
  relationships?: {
    view: {
      data: IRelationship;
    };
  };
}

export interface IInsightsCategory {
  data: IInsightsCategoryData;
}

export interface IInsightsCategories {
  data: IInsightsCategoryData[];
}
