import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import commentKeys from './keys';
import {
  CommentsKeys,
  ICommentParameters,
  IComments,
  ICommentQueryParameters,
} from './types';

const getCommentsEndpoint = ({
  ideaId,
  authorId,
  commentId,
}: ICommentParameters) => {
  if (ideaId) {
    return `ideas/${ideaId}/comments`;
  } else if (commentId) {
    return `comments/${commentId}/children`;
  } else return `users/${authorId}/comments`;
};

const fetchComments = (
  parameters: ICommentParameters & ICommentQueryParameters
) =>
  fetcher<IComments>({
    path: `/${getCommentsEndpoint(parameters)}`,
    action: 'get',
    queryParams: {
      'page[size]': parameters.pageSize || 10,
      'page[number]': parameters.pageNumber,
      sort: parameters.sort,
    },
  });

const useComments = (
  parameters: ICommentParameters & ICommentQueryParameters,
  hasComments = true
) => {
  return useInfiniteQuery<IComments, CLErrors, IComments, CommentsKeys>({
    queryKey: commentKeys.list(parameters),
    queryFn: ({ pageParam }) =>
      fetchComments({ ...parameters, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);

      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled:
      hasComments &&
      (!!parameters.authorId || !!parameters.ideaId || !!parameters.commentId),
  });
};

export default useComments;
