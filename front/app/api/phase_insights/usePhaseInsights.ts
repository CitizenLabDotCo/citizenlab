import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import phaseInsightsKeys from './keys';
import { IPhaseInsights } from './types';

/**
 * Fetches consolidated phase insights from the backend
 * Returns full JSONAPI response structure with metrics and demographics
 */
const fetchPhaseInsights = (phaseId: string) =>
  fetcher<IPhaseInsights>({
    path: `/phases/${phaseId}/insights`,
    action: 'get',
  });

interface UsePhaseInsightsParams {
  phaseId: string;
}

/**
 * Hook to fetch consolidated phase insights (metrics + demographics)
 * Returns standard React Query result with full JSONAPI structure
 * Access data via:
 *   - metrics: data.data.attributes.metrics
 *   - demographics: data.data.attributes.demographics
 */
const usePhaseInsights = ({ phaseId }: UsePhaseInsightsParams) => {
  return useQuery<IPhaseInsights, CLErrors, IPhaseInsights>({
    queryKey: phaseInsightsKeys.item({ phaseId }),
    queryFn: () => fetchPhaseInsights(phaseId),
    enabled: !!phaseId,
  });
};

export default usePhaseInsights;
