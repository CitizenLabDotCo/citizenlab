import { ILinks, IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import analysisHeatmapCellsKeys from './keys';

export type AnalysisHeatmapCellsKeys = Keys<typeof analysisHeatmapCellsKeys>;

export interface IAnalysisHeatmapCells {
  data: IAnalysisHeatmapCellData[];
  links: ILinks;
}

export type Unit = 'inputs' | 'likes' | 'dislikes' | 'participants';

export interface IAnalysisHeatmapCellData {
  id: string;
  type: 'heatmap_cell';
  attributes: {
    created_at: string;
    updated_at: string;
    unit: Unit;
    count: number;
    lift: number;
    p_value: number;
    statement_multiloc: Multiloc;
  };
  relationships: {
    row: { data: IRelationship } | null;
    column: { data: IRelationship } | null;
    analysis: { data: IRelationship } | null;
  };
}

export interface IAnalysysHeatmapCellsParams {
  analysisId: string;
  pageSize?: number;
  pageNumber?: number;
  rowCategoryType?: 'tags' | 'user_custom_field';
  columnCategoryType?: 'tags' | 'user_custom_field';
  columnCategoryId?: string;
  maxPValue?: number;
  minLiftDiff?: number;
  unit?: Unit;
}
