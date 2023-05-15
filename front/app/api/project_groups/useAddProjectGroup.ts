import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectGroupsKeys from './keys';
import { IProjectGroup, IProjectGroupsAdd } from './types';

const addProjectGroup = async ({ groupId, projectId }: IProjectGroupsAdd) =>
  fetcher<IProjectGroup>({
    path: `/projects/${projectId}/groups_projects`,
    action: 'post',
    body: {
      groups_project: {
        group_id: groupId,
      },
    },
  });

const useAddProjectGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<IProjectGroup, CLErrors, IProjectGroupsAdd>({
    mutationFn: addProjectGroup,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectGroupsKeys.list({ projectId: variables.projectId }),
      });
    },
  });
};

export default useAddProjectGroup;
