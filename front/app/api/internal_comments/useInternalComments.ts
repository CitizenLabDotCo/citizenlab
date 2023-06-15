import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import internalCommentKeys from './keys';
import {
  InternalCommentsKeys,
  IInternalCommentParameters,
  IInternalComments,
  IInternalCommentQueryParameters,
} from './types';

const getInternalCommentsEndpoint = ({
  ideaId,
  initiativeId,
  userId,
  commentId,
}: IInternalCommentParameters) => {
  if (ideaId) {
    return `ideas/${ideaId}/internal_comments`;
  } else if (initiativeId) {
    return `initiatives/${initiativeId}/internal_comments`;
  } else if (commentId) {
    return `internal_comments/${commentId}/children`;
  } else return `users/${userId}/internal_comments`;
};

const fetchInternalComments = (
  parameters: IInternalCommentParameters & IInternalCommentQueryParameters
) =>
  fetcher<IInternalComments>({
    path: `/${getInternalCommentsEndpoint(parameters)}`,
    action: 'get',
    queryParams: {
      'page[size]': parameters.pageSize || 10,
      'page[number]': parameters.pageNumber,
      sort: parameters.sort,
    },
  });

const useInternalComments = (
  parameters: IInternalCommentParameters & IInternalCommentQueryParameters
) => {
  return useInfiniteQuery<
    IInternalComments,
    CLErrors,
    IInternalComments,
    InternalCommentsKeys
  >({
    queryKey: internalCommentKeys.list(parameters),
    queryFn: ({ pageParam }) =>
      fetchInternalComments({ ...parameters, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);

      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled:
      !!parameters.userId ||
      !!parameters.initiativeId ||
      !!parameters.ideaId ||
      !!parameters.commentId,
  });
};

export default useInternalComments;
