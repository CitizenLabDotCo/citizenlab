import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { getDummyDemographics, USE_DUMMY_DATA } from './dummyData';
import { demographicsKey } from './keys';
import { PhaseInsightsDemographics } from './types';

const fetchDemographics = async (
  phaseId: string
): Promise<PhaseInsightsDemographics> => {
  const response = await fetch(
    `/api/v1/phases/${phaseId}/insights/demographics`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch demographics');
  }
  return response.json();
};

interface UseDemographicsParams {
  phaseId: string;
  userDataCollection: string;
}

const useDemographics = ({
  phaseId,
  userDataCollection,
}: UseDemographicsParams) => {
  return useQuery<
    PhaseInsightsDemographics,
    CLErrors,
    PhaseInsightsDemographics
  >({
    queryKey: demographicsKey(phaseId),
    queryFn: async () => {
      // Don't fetch demographics for anonymous phases
      if (userDataCollection === 'anonymous') {
        return {};
      }

      if (USE_DUMMY_DATA) {
        // Return dummy data for development
        return getDummyDemographics();
      }
      // Fetch real data from backend
      return fetchDemographics(phaseId);
    },
    enabled: !!phaseId && userDataCollection !== 'anonymous',
  });
};

export default useDemographics;
