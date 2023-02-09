import { IRelationship } from 'typings';
import viewsKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type ViewsKeys = Keys<typeof viewsKeys>;

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
