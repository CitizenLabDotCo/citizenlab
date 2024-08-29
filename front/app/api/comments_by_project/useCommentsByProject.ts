import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import commentsByProjectKeys from './keys';
import {
  ICommentsByProject,
  CommentsByProjectKeys,
  ICommentsByProjectParams,
} from './types';

const fetchCommentsByProject = (params: ICommentsByProjectParams) =>
  fetcher<ICommentsByProject>({
    path: `/stats/comments_by_project`,
    action: 'get',
    queryParams: params,
  });

const useCommentsByProject = ({
  enabled,
  ...queryParameters
}: ICommentsByProjectParams & { enabled: boolean }) => {
  return useQuery<
    ICommentsByProject,
    CLErrors,
    ICommentsByProject,
    CommentsByProjectKeys
  >({
    queryKey: commentsByProjectKeys.item(queryParameters),
    queryFn: () => fetchCommentsByProject(queryParameters),
    enabled,
  });
};

export default useCommentsByProject;
