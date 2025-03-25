import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryExternalCommentsKeys from './keys';
import { DeleteParams } from './types';

export const deleteLibraryExternalComment = ({
  externalCommentId,
}: DeleteParams) => {
  return fetcher({
    path: `/external_comments/${externalCommentId}`,
    action: 'delete',
    apiPath: '/project_library_api',
  });
};

const useUpdateProjectLibraryExternalComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLibraryExternalComment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectLibraryExternalCommentsKeys.list({
          projectId: variables.projectId,
        }),
      });
    },
  });
};

export default useUpdateProjectLibraryExternalComment;
