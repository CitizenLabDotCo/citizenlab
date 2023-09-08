import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import topicsKeys from './keys';
import { ITopics, TopicsKeys, ITopicsQueryParams } from './types';

const fetchTopics = ({
  forHomepageFilter,
  forOnboarding,
  includeStaticPages,
  excludeCode,
  ...queryParameters
}: ITopicsQueryParams) =>
  fetcher<ITopics>({
    path: `/topics`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      for_homepage_filter: forHomepageFilter,
      for_onboarding: forOnboarding,
      exclude_code: excludeCode,
      ...(includeStaticPages && {
        include: 'static_pages',
      }),
    },
  });

const useTopics = (queryParameters?: ITopicsQueryParams) => {
  return useQuery<ITopics, CLErrors, ITopics, TopicsKeys>({
    queryKey: topicsKeys.list(queryParameters || {}),
    queryFn: () => fetchTopics(queryParameters || {}),
  });
};

export default useTopics;
