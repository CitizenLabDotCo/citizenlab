import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import topicsKeys from './keys';
import { ITopics, TopicsKeys, ITopicsQueryParams } from './types';

const fetchTopics = ({
  forHomepageFilter,
  forOnboarding,
  includeStaticPages,

  ...queryParameters
}: ITopicsQueryParams) =>
  fetcher<ITopics>({
    path: `/topics`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      for_homepage_filter: forHomepageFilter,
      for_onboarding: forOnboarding,
      ...(includeStaticPages && {
        include: 'static_pages',
      }),
    },
  });

const useTopics = (
  queryParameters?: ITopicsQueryParams,
  { enabled = true } = {}
) => {
  return useQuery<ITopics, CLErrors, ITopics, TopicsKeys>({
    queryKey: topicsKeys.list(queryParameters || {}),
    queryFn: () => fetchTopics(queryParameters || {}),
    enabled,
  });
};

export default useTopics;
