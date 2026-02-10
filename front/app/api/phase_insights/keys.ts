import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'phase_insights',
};

const phaseInsightsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ phaseId }: { phaseId: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { phaseId },
    },
  ],
} satisfies QueryKeys;

export default phaseInsightsKeys;
