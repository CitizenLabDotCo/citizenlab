import { IParameters } from './types';
import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'official_feedback', variant: 'initiative' };

const initiativeOfficialFeedbackKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: IParameters) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default initiativeOfficialFeedbackKeys;
