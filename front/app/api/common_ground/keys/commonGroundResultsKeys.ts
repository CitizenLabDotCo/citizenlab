import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'phase-results' };

const commonGroundResultsKeys = {
  all: () => [baseKey],
  list: ({ phaseId }: { phaseId: string | undefined }) => [
    { ...baseKey, operation: 'list', parameters: { phaseId } },
  ],
} satisfies QueryKeys;

export default commonGroundResultsKeys;
