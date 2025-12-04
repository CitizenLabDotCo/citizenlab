import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'phase_insights' };

const phaseInsightsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: Record<string, string>) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export const phaseInsightsKey = (phaseId: string) =>
  phaseInsightsKeys.item({ phaseId, type: 'insight' });

export const commonGroundResultsKey = ({
  phaseId,
  sort,
  groupBy,
}: {
  phaseId: string;
  sort?: string;
  groupBy?: string;
}) => {
  const params: Record<string, string> = {
    phaseId,
    type: 'common_ground_results',
  };
  if (sort) params.sort = sort;
  if (groupBy) params.groupBy = groupBy;
  return phaseInsightsKeys.item(params);
};
