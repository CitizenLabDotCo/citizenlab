import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { getDummyDemographics, USE_DUMMY_DATA } from './dummyData';
import { demographicsKey } from './keys';
import { IPhaseInsightsDemographics } from './types';

/**
 * Fetches raw demographics data from the backend
 * Returns full JSONAPI response structure (data.attributes contains fields)
 * Components handle transformation as needed
 */
const fetchDemographics = (phaseId: string) =>
  fetcher<IPhaseInsightsDemographics>({
    path: `/phases/${phaseId}/insights/demographics`,
    action: 'get',
  });

interface UseDemographicsParams {
  phaseId: string;
  userDataCollection: string;
}

/**
 * Hook to fetch demographics data in backend format (series/options)
 * Returns standard React Query result with full JSONAPI structure
 * Access fields via: data.data.attributes.fields
 * Components should use transformDemographicsResponse() utility for transformation
 */
const useDemographics = ({
  phaseId,
  userDataCollection,
}: UseDemographicsParams) => {
  return useQuery<
    IPhaseInsightsDemographics,
    CLErrors,
    IPhaseInsightsDemographics
  >({
    queryKey: demographicsKey(phaseId),
    queryFn: () => {
      if (USE_DUMMY_DATA) {
        return getDummyDemographics();
      }

      // Don't fetch demographics for anonymous phases
      if (userDataCollection === 'anonymous') {
        return Promise.resolve({
          data: {
            id: phaseId,
            type: 'phase_demographics',
            attributes: { fields: [] },
          },
        });
      }

      // Fetch raw backend data
      return fetchDemographics(phaseId);
    },
    enabled: userDataCollection !== 'anonymous',
  });
};

export default useDemographics;
