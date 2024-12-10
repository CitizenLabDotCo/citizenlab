import { useMutation, useQueryClient } from '@tanstack/react-query';

import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import homepageBuilderKeys from 'api/home_page_layout/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';

const deleteProject = (id: string) =>
  fetcher({
    path: `/projects/${id}`,
    action: 'delete',
  });

const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectsKeys.item({ id }) });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsStatusCountsKeys.items(),
      });
      queryClient.invalidateQueries({
        queryKey: homepageBuilderKeys.all(),
      });
    },
  });
};

export default useDeleteProject;
