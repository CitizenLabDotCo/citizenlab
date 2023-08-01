import { QueryKeys } from 'utils/cl-react-query/types';
import { ISummaryParams } from './types';

const baseKey = { type: 'summary' };

const summariesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: ISummaryParams) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default summariesKeys;
