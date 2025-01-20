import { ImageSizes, Multiloc } from 'typings';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import { Keys } from 'utils/cl-react-query/types';

import surveyResultsKeys from './keys';

export type SurveyResultsKeys = Keys<typeof surveyResultsKeys>;

export type IParameters = {
  phaseId: string | null;
  filterLogicIds: string[];
};

export interface Answer {
  answer: string | number | null;
  count: number;
}

export type MultilocAnswer = {
  title_multiloc: Multiloc;
  id: string;
  logicNextPageId: string | null;
  image?: ImageSizes;
};

export interface AnswerMultilocs {
  answer: Record<string, MultilocAnswer>;
}

export type GroupedAnswer = Answer & {
  groups: { group: string | null; count: number }[];
};

export type AnswerMultilocsGrouped = AnswerMultilocs & {
  group: Record<string, MultilocAnswer>;
};

type BaseResult = {
  inputType: ICustomFieldInputType;
  question: Multiloc;
  description: Multiloc;
  customFieldId: string;
  required: boolean;
  hidden: boolean;
  totalResponseCount: number;
  totalPickCount: number;
  questionResponseCount: number;
  questionNumber: number;
  pageNumber: number;
  logicNextPageId: string | null;
  numberResponses?: { answer: number }[];

  // Defined for text questions,
  // and for select questions with "other" option
  textResponses?: { answer: string }[];
};

export type ResultUngrouped = BaseResult & {
  grouped: false;
  answers: Answer[];

  // Undefined for text and file upload questions
  multilocs?: AnswerMultilocs;

  // Defined map questions
  mapConfigId?: string;
  pointResponses?: { answer: GeoJSON.Point }[];
  lineResponses?: { answer: GeoJSON.LineString }[];
  polygonResponses?: { answer: GeoJSON.Polygon }[];

  // Defined for file upload questions
  files?: { name: string; url: string }[];
};

export type ResultGrouped = BaseResult & {
  grouped: true;
  answers: GroupedAnswer[];
  multilocs: AnswerMultilocsGrouped;
  legend: (string | null)[];
};

export interface SurveyResultAttributes {
  results: ResultUngrouped[];
  totalSubmissions: number;
}

export interface SurveyResultsType {
  data: {
    type: 'survey_results';
    attributes: SurveyResultAttributes;
  };
}

export interface LogicConfig {
  toggleLogicIds: (optionId: string) => void;
  filterLogicIds: string[];
  isLoading: boolean;
}
