import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'phase_insights' };

const phaseInsightsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: Record<string, string>) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export const participationMetricsKey = (phaseId: string) =>
  phaseInsightsKeys.item({ phaseId, type: 'participation_metrics' });

export const demographicsKey = (phaseId: string) =>
  phaseInsightsKeys.item({ phaseId, type: 'demographics' });

export default phaseInsightsKeys;
