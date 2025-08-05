import { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import participantCountKeys from './keys';
import { ParticipantCounts, ParticipantCountsKeys } from './types';

const fetchParticipantCounts = async (projectIds: string[]) => {
  return fetcher<ParticipantCounts>({
    path: '/projects/participant_counts',
    action: 'get',
    queryParams: {
      project_ids: projectIds,
    },
  });
};

// Client-side caching to avoid sending super long lists
// of project IDs in the query
const PARTICIPANTS_PER_PROJECT_CACHE: Record<string, number> = {};

const useParticipantCounts = (projectIds: string[]) => {
  const [participantsPerProjectCache, setParticipantsPerProjectCache] =
    useState(PARTICIPANTS_PER_PROJECT_CACHE);

  // Only fetch project ids that are not already cached
  const projectIdsToFetch = projectIds.filter(
    (projectId) => !(projectId in PARTICIPANTS_PER_PROJECT_CACHE)
  );

  const { data } = useQuery<
    ParticipantCounts,
    CLErrors,
    ParticipantCounts,
    ParticipantCountsKeys
  >({
    queryKey: participantCountKeys.list({ project_ids: projectIdsToFetch }),
    queryFn: () => fetchParticipantCounts(projectIdsToFetch),
    enabled: projectIdsToFetch.length > 0,
  });

  const participantCountsResponse = data?.data.attributes.participant_counts;

  // Add the fetched counts to the cache
  useEffect(() => {
    if (participantCountsResponse) {
      Object.entries(participantCountsResponse).forEach(
        ([projectId, count]) => {
          PARTICIPANTS_PER_PROJECT_CACHE[projectId] = count;
        }
      );

      // Update the state to trigger a re-render with the new cache
      setParticipantsPerProjectCache({
        ...PARTICIPANTS_PER_PROJECT_CACHE,
      });
    }
  }, [participantCountsResponse]);

  return participantsPerProjectCache;
};

export default useParticipantCounts;
