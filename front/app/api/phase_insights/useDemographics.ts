import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { getDummyDemographics, USE_DUMMY_DATA } from './dummyData';
import { demographicsKey } from './keys';
import { PhaseInsightsDemographics } from './types';

const fetchDemographics = async (
  phaseId: string
): Promise<PhaseInsightsDemographics> => {
  // TODO: This will call the backend endpoint when ready
  // Backend should aggregate all enabled user custom fields (select + birthyear)
  // and return demographic data for each field
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
      if (USE_DUMMY_DATA) {
        return getDummyDemographics();
      }

      // Don't fetch demographics for anonymous phases in production
      if (userDataCollection === 'anonymous') {
        return { fields: [] };
      }

      // Fetch real data from backend
      return fetchDemographics(phaseId);
    },
    enabled: userDataCollection !== 'anonymous',
  });
};

export default useDemographics;
