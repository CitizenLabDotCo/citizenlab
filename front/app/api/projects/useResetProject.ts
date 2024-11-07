import { useMutation, useQueryClient } from '@tanstack/react-query';

import basketsKeys from 'api/baskets/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';
import causesKeys from 'api/causes/keys';
import commentsKeys from 'api/comments/keys';
import eventsKeys from 'api/events/keys';
import ideasKeys from 'api/ideas/keys';
import pollReponsesKeys from 'api/poll_responses/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';

const resetProject = (id: string) =>
  fetcher({
    path: `/projects/${id}/participation_data`,
    action: 'delete',
  });

const useResetProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetProject,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.item({ id }) });
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pollReponsesKeys.all() });
      queryClient.invalidateQueries({ queryKey: causesKeys.all() });
      // These queries need to be removed, not just invalidated because a 404 response is expected.
      // Removing the queries will prevent stale data from being displayed.
      queryClient.removeQueries({ queryKey: basketsKeys.all() });
      queryClient.removeQueries({ queryKey: basketsIdeasKeys.all() });
    },
  });
};

export default useResetProject;
