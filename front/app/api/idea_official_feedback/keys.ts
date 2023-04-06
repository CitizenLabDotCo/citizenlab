import { QueryKeys } from 'utils/cl-react-query/types';
import { IParameters } from './types';

const baseKey = { type: 'official_feedback', variant: 'idea' };

const ideaOfficialFeedbackKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: IParameters) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default ideaOfficialFeedbackKeys;
