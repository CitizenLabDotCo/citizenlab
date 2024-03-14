import { ImageSizes, Multiloc } from 'typings';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import { Keys } from 'utils/cl-react-query/types';

import surveyResultsKeys from './keys';

export type SurveyResultsKeys = Keys<typeof surveyResultsKeys>;

export type IParameters = {
  phaseId: string | null;
};

export interface Answer {
  answer: string | number | null;
  count: number;
}

export type MultilocAnswer = {
  title_multiloc: Multiloc;
  image?: ImageSizes;
};

export interface AnswerMultilocs {
  answer: Record<string, MultilocAnswer>;
}

export interface Result {
  inputType: ICustomFieldInputType;
  question: Multiloc;
  required: boolean;
  mapConfigId?: string;
  customFieldId: string;
  totalResponseCount: number;
  questionResponseCount: number;
  totalPickCount?: number;
  answers?: Answer[];
  textResponses?: { answer: string }[];
  files?: { name: string; url: string }[];
  pointResponses?: { response: GeoJSON.Point }[];
  multilocs?: AnswerMultilocs;
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
