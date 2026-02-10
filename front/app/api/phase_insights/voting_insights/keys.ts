import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'voting_phase_votes',
};

const votingInsightsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ phaseId, groupBy }: { phaseId: string; groupBy?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { phaseId, groupBy },
    },
  ],
} satisfies QueryKeys;

export default votingInsightsKeys;
