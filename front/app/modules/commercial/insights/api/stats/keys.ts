import { QueryKeys } from 'utils/cl-react-query/types';
import { QueryParameters } from './types';

const baseStatsKey = { type: 'inputs_stat' };
const statsKeys = {
  all: () => [baseStatsKey],
  items: () => [{ ...baseStatsKey, operation: 'item' }],
  item: ({
    viewId,
    filters,
  }: {
    viewId: string;
    filters?: QueryParameters;
  }) => [
    { ...baseStatsKey, operation: 'item', parameters: { viewId, ...filters } },
  ],
} satisfies QueryKeys;

export default statsKeys;
