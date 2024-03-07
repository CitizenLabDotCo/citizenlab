import { Multiloc } from 'typings';
import surveyResultsKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';
import { ICustomFieldInputType } from 'api/custom_fields/types';

export type SurveyResultsKeys = Keys<typeof surveyResultsKeys>;

export type IParameters = {
  phaseId: string | null;
};

export interface Answer {
  answer: string | null;
  count: number;
}

// TODO: JS - complete this typing
export interface AnswerMultilocs {
  answer: any;
  group?: any;
}

export interface Result {
  inputType: ICustomFieldInputType;
  question: Multiloc;
  required: boolean;
  customFieldId: string;
  questionResponseCount: number;
  answers?: Answer[];
  textResponses?: { answer: string }[];
  files?: { name: string; url: string }[];
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
