import { QueryKeys } from 'utils/cl-react-query/types';
import { IParameters } from './types';

const baseKey = {
  type: 'survey_results',
};

const surveyResultsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: IParameters) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default surveyResultsKeys;
