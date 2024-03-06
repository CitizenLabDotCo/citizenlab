import { ImageSizes, Multiloc } from 'typings';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import { Keys } from 'utils/cl-react-query/types';

import surveyResultsKeys from './keys';

export type SurveyResultsKeys = Keys<typeof surveyResultsKeys>;

export type IParameters = {
  phaseId: string | null;
};

export interface Answer {
  answer: Multiloc;
  responses: number;
  image?: ImageSizes;
}

export interface Result {
  inputType: ICustomFieldInputType;
  question: Multiloc;
  totalResponses: number;
  answers?: Answer[];
  required: boolean;
  customFieldId: string;
  textResponses?: { answer: string }[];
  files?: { name: string; url: string }[];
}

export interface SurveyResultAttributes {
  results: Result[];
  totalSubmissions: number;
}

export interface SurveyResultsType {
  data: {
    type: 'survey_results';
    attributes: SurveyResultAttributes;
  };
}
