import { IRelationship } from 'typings';
import viewsKeys from './keys';

export type ViewsKeys = ReturnType<typeof viewsKeys[keyof typeof viewsKeys]>;

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
