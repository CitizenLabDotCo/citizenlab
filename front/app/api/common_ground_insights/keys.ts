import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'common_ground_insights',
};

const commonGroundInsightsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({
    phaseId,
    sort,
    groupBy,
  }: {
    phaseId: string;
    sort?: string;
    groupBy?: string;
  }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { phaseId, sort, groupBy },
    },
  ],
} satisfies QueryKeys;

export default commonGroundInsightsKeys;
