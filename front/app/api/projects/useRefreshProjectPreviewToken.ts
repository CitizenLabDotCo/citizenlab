import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';
import { IProject } from './types';

export const updateProjectPreviewToken = async ({
  projectId,
}: {
  projectId: string;
}) =>
  fetcher<IProject>({
    path: `/projects/${projectId}/refresh_preview_token`,
    action: 'post',
    body: null,
  });

const useUpdateProjectPreviewToken = () => {
  const queryClient = useQueryClient();
  return useMutation<IProject, CLErrorsWrapper, { projectId: string }>({
    mutationFn: updateProjectPreviewToken,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: projectsKeys.items(),
      });
    },
  });
};

export default useUpdateProjectPreviewToken;
