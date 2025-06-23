import { ILinks, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import analysesKeys from './keys';

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
    participation_method:
      | 'native_survey'
      | 'ideation'
      | 'community_monitor_survey'
      | 'proposals';
    show_insights: boolean;
  };
  relationships: {
    project?: { data: IRelationship | null } | null;
    phase?: { data: IRelationship | null } | null;
    all_custom_fields: { data: IRelationship[] };
    additional_custom_fields?: { data: IRelationship[] };
    main_custom_field?: { data: IRelationship | null };
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
  additionalCustomFields?: string[];
  mainCustomField?: string;
}
