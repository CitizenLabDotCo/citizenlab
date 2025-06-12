import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'common_ground_progress' };

const commonGroundProgressKeys = {
  all: () => [baseKey],
  list: ({ phaseId }: { phaseId: string | undefined }) => [
    { ...baseKey, operation: 'list', parameters: { phaseId } },
  ],
} satisfies QueryKeys;

export default commonGroundProgressKeys;
