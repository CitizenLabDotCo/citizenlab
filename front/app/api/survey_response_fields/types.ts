import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import surveyResponseFieldsKeys from './keys';

export type SurveyResponseFieldsKeys = Keys<typeof surveyResponseFieldsKeys>;

export interface ISurveyResponseFieldData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    // True for registration/personal-data fields (pre-selected for redaction).
    personal_data: boolean;
  };
}

export interface ISurveyResponseFields {
  data: ISurveyResponseFieldData[];
}

export interface ISurveyResponseFieldsParameters {
  phaseId: string;
}
