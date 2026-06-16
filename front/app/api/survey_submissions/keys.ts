import { QueryKeys } from 'utils/cl-react-query/types';

import { ISurveySubmissionsQueryParameters } from './types';

const baseKey = {
  type: 'survey_submission',
};

const surveySubmissionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: ISurveySubmissionsQueryParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default surveySubmissionsKeys;
