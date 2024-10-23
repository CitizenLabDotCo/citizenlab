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

const getInternalCommentsEndpoint = (params: IInternalCommentParameters) => {
  const { type } = params;

  switch (type) {
    case 'idea':
      return `ideas/${params.ideaId}/internal_comments`;
    case 'comment':
      return `internal_comments/${params.commentId}/children`;
    case 'author':
    default:
      return `users/${params.authorId}/internal_comments`;
  }
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);

      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useInternalComments;
