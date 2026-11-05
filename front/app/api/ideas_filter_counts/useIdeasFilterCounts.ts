import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaFilterCountKeys from './keys';
import {
  IIdeasFilterCounts,
  IIdeasFilterCountsQueryParameters,
  IdeaFilterCountsKeys,
} from './types';

const fetchIdeaFilterCounts = ({
  ...queryParams
}: IIdeasFilterCountsQueryParameters) =>
  fetcher<IIdeasFilterCounts>({
    path: `/ideas/filter_counts`,
    action: 'get',
    queryParams: {
      ...queryParams,
      'page[size]': undefined,
      'page[number]': undefined,
    },
  });

const useIdeasFilterCounts = (
  queryParams: IIdeasFilterCountsQueryParameters,
  enabled = true
) => {
  return useQuery<
    IIdeasFilterCounts,
    CLErrors,
    IIdeasFilterCounts,
    IdeaFilterCountsKeys
  >({
    queryKey: ideaFilterCountKeys.item(queryParams),
    queryFn: () => fetchIdeaFilterCounts(queryParams),
    enabled,
  });
};

export default useIdeasFilterCounts;
