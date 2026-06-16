import { ILinks } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import surveySubmissionsKeys from './keys';

export type SurveySubmissionsKeys = Keys<typeof surveySubmissionsKeys>;

export interface ISurveySubmissionData {
  id: string;
  type: string;
  attributes: {
    created_at: string;
    custom_field_values: Record<string, any>;
  };
}

export interface ISurveySubmissions {
  data: ISurveySubmissionData[];
  links: ILinks;
}

export interface ISurveySubmissionsQueryParameters {
  phaseId: string;
  pageSize?: number;
}
