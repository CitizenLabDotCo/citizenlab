import { IRelationship } from 'typings';
import viewKeys from './keys';

export type ViewKeys = ReturnType<typeof viewKeys[keyof typeof viewKeys]>;

export interface IInsightsViewData {
  id: string;
  type: 'view';
  attributes: {
    name: string;
    updated_at: string;
  };
  relationships?: {
    data_sources: {
      data: IRelationship[];
    };
  };
}

export type IInsightsView = { data: IInsightsViewData };
export type IInsightsViews = { data: IInsightsViewData[] };
