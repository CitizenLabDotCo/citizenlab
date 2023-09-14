import { Keys } from 'utils/cl-react-query/types';
import analysesKeys from './keys';
import { ILinks, IRelationship } from 'typings';

export type AnalysesKeys = Keys<typeof analysesKeys>;

export interface IAnalyses {
  data: IAnalysisData[];
  links: ILinks;
}

export interface IAnalysisData {
  id: string;
  type: 'analysis';
  attributes: {
    created_at: string;
    updated_at: string;
    participation_method: 'native_survey' | 'ideation';
  };
  relationships: {
    project?: { data: IRelationship } | null;
    phase?: { data: IRelationship } | null;
    custom_fields: { data: IRelationship[] };
  };
}

export interface IAnalysis {
  data: IAnalysisData;
}

export interface IAnalysesQueryParams {
  projectId?: string;
  phaseId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IAddAnalysis {
  projectId?: string;
  phaseId?: string;
  customFieldIds?: string[];
}
