import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { getDummyParticipationMetrics, USE_DUMMY_DATA } from './dummyData';
import { participationMetricsKey } from './keys';
import { IPhaseInsightsParticipationMetrics } from './types';

/**
 * Fetches participation metrics from the backend
 * Returns full JSONAPI response structure
 */
const fetchParticipationMetrics = (phaseId: string) =>
  fetcher<IPhaseInsightsParticipationMetrics>({
    path: `/phases/${phaseId}/insights/participation_metrics`,
    action: 'get',
  });

interface UseParticipationMetricsParams {
  phaseId: string;
  participationMethod: string;
}

/**
 * Hook to fetch participation metrics
 * Returns standard React Query result with full JSONAPI structure
 * Access metrics via: data.data.attributes
 */
const useParticipationMetrics = ({
  phaseId,
  participationMethod,
}: UseParticipationMetricsParams) => {
  return useQuery<
    IPhaseInsightsParticipationMetrics,
    CLErrors,
    IPhaseInsightsParticipationMetrics
  >({
    queryKey: participationMetricsKey(phaseId),
    queryFn: () =>
      USE_DUMMY_DATA
        ? getDummyParticipationMetrics(participationMethod)
        : fetchParticipationMetrics(phaseId),
    enabled: !!phaseId,
  });
};

export default useParticipationMetrics;
