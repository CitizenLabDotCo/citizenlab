import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

export type SurveyQuestionResultResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: ResultGrouped | ResultUngrouped;
  };
};
