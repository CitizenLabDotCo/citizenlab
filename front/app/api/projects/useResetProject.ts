import { useMutation, useQueryClient } from '@tanstack/react-query';

import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import eventsKeys from 'api/events/keys';
import ideasKeys from 'api/ideas/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';

const resetProject = (id: string) =>
  fetcher({
    path: `/projects/${id}/reset_participation_data`,
    action: 'delete',
  });

const useResetProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetProject,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectsKeys.item({ id }) });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsStatusCountsKeys.items(),
      });
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
  });
};

export default useResetProject;
