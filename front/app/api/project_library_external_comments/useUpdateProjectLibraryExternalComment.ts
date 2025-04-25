import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryExternalCommentsKeys from './keys';
import { UpdateParams, ExternalComment } from './types';

export const updateLibraryExternalComment = ({
  externalCommentId,
  externalCommentReqBody,
}: UpdateParams) => {
  return fetcher<ExternalComment>({
    path: `/external_comments/${externalCommentId}`,
    action: 'patch',
    apiPath: '/project_library_api',
    body: {
      external_comment: externalCommentReqBody,
    },
  });
};

const useUpdateProjectLibraryExternalComment = () => {
  const queryClient = useQueryClient();
  return useMutation<ExternalComment, CLErrors, UpdateParams>({
    mutationFn: updateLibraryExternalComment,
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
