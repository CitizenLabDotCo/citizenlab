import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import followUnfollowKeys from './keys';
import { FollowUnfollowKeys, IFollowers, IParameters } from './types';

const defaultPageSize = 12;

const fetchFollowers = async ({
  followableObject,
  pageNumber,
  pageSize,
}: IParameters) =>
  fetcher<IFollowers>({
    path: `/followers`,
    action: 'get',
    queryParams: {
      followable_type: followableObject,
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
    },
  });

const useFollowers = (parameters: IParameters) => {
  return useInfiniteQuery<IFollowers, CLErrors, IFollowers, FollowUnfollowKeys>(
    {
      queryKey: followUnfollowKeys.list(parameters),
      queryFn: ({ pageParam }) =>
        fetchFollowers({ ...parameters, pageNumber: pageParam }),
      getNextPageParam: (lastPage) => {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const hasNextPage = lastPage.links?.next;
        const pageNumber = getPageNumberFromUrl(lastPage.links.self);

        return hasNextPage && pageNumber ? pageNumber + 1 : null;
      },
    }
  );
};

export default useFollowers;
