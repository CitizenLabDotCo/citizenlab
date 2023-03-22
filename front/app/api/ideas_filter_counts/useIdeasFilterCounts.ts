import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
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
      idea_status: undefined,
    },
  });

const useIdeasFilterCounts = (
  queryParams: IIdeasFilterCountsQueryParameters
) => {
  return useQuery<
    IIdeasFilterCounts,
    CLErrors,
    IIdeasFilterCounts,
    IdeaFilterCountsKeys
  >({
    queryKey: initiativesKeys.item(queryParams),
    queryFn: () => fetchIdeaFilterCounts(queryParams),
  });
};

export default useIdeasFilterCounts;
