import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'common_ground_results' };

const commonGroundResultsKeys = {
  all: () => [baseKey],
  list: ({ phaseId }: { phaseId?: string }) => [
    { ...baseKey, operation: 'list', parameters: { phaseId } },
  ],
} satisfies QueryKeys;

export default commonGroundResultsKeys;
