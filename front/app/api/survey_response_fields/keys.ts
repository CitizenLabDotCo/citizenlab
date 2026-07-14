import { QueryKeys } from 'utils/cl-react-query/types';

import { ISurveyResponseFieldsParameters } from './types';

const baseKey = {
  type: 'survey_response_field',
};

const surveyResponseFieldsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: ISurveyResponseFieldsParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default surveyResponseFieldsKeys;
