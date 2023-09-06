import { QueryKeys } from 'utils/cl-react-query/types';
import { IInsightsParams } from './types';

const baseKey = { type: 'insight' };

const insightsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IInsightsParams) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default insightsKeys;
