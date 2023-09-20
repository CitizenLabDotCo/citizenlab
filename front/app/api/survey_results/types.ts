import { Multiloc } from 'typings';
import surveyResultsKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type SurveyResultsKeys = Keys<typeof surveyResultsKeys>;

export type IParameters = {
  projectId: string;
  phaseId?: string | null;
};

export interface Answer {
  answer: Multiloc;
  responses: number;
}

export interface Result {
  inputType: string;
  question: Multiloc;
  totalResponses: number;
  answers: Answer[];
  required: boolean;
  customFieldId: string;
}

export interface SurveyResultData {
  type: 'survey_results';
  attributes: {
    results: Result[];
    totalSubmissions: number;
  };
}

export interface SurveyResultsType {
  data: SurveyResultData;
}
