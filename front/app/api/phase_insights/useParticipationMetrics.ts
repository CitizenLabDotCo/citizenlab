import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { getDummyParticipationMetrics, USE_DUMMY_DATA } from './dummyData';
import { participationMetricsKey } from './keys';
import { PhaseInsightsParticipationMetrics } from './types';

const fetchParticipationMetrics = async (
  phaseId: string
): Promise<PhaseInsightsParticipationMetrics> => {
  // TODO: Update this when backend endpoint is ready
  // Backend should return the data directly, not wrapped in { data: ... }
  const response = await fetch(
    `/api/v1/phases/${phaseId}/insights/participation_metrics`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch participation metrics');
  }
  return response.json();
};

interface UseParticipationMetricsParams {
  phaseId: string;
  participationMethod: string;
}

const useParticipationMetrics = ({
  phaseId,
  participationMethod,
}: UseParticipationMetricsParams) => {
  return useQuery<
    PhaseInsightsParticipationMetrics,
    CLErrors,
    PhaseInsightsParticipationMetrics
  >({
    queryKey: participationMetricsKey(phaseId),
    queryFn: async () => {
      if (USE_DUMMY_DATA) {
        // Return dummy data for development
        return getDummyParticipationMetrics(participationMethod);
      }
      // Fetch real data from backend
      return fetchParticipationMetrics(phaseId);
    },
    enabled: !!phaseId,
  });
};

export default useParticipationMetrics;
