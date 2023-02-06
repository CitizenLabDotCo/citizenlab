import { IRelationship } from 'typings';
import categoryKeys from './keys';

export type CategoryKeys = ReturnType<
  typeof categoryKeys[keyof typeof categoryKeys]
>;

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
