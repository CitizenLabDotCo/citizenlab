import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryExternalCommentsKeys from './keys';
import { AddParams, ExternalComment } from './types';

export const addLibraryExternalComment = ({
  projectId,
  externalCommentReqBody,
}: AddParams) => {
  return fetcher<ExternalComment>({
    path: `/projects/${projectId}/external_comments`,
    action: 'post',
    apiPath: '/project_library_api',
    body: {
      external_comment: externalCommentReqBody,
    },
  });
};

const useAddProjectLibraryExternalComment = () => {
  const queryClient = useQueryClient();
  return useMutation<ExternalComment, CLErrors, AddParams>({
    mutationFn: addLibraryExternalComment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectLibraryExternalCommentsKeys.list({
          projectId: variables.projectId,
        }),
      });
    },
  });
};

export default useAddProjectLibraryExternalComment;
