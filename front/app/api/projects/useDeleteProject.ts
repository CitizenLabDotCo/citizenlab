import { useMutation, useQueryClient } from '@tanstack/react-query';

import contentBuilderKeys from 'api/content_builder/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { invalidateOnCRUD } from './utils';

const deleteProject = (id: string) =>
  fetcher({
    path: `/projects/${id}`,
    action: 'delete',
  });

const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_data) => {
      invalidateOnCRUD();
      queryClient.invalidateQueries({
        queryKey: contentBuilderKeys.all(),
      });
    },
  });
};

export default useDeleteProject;
