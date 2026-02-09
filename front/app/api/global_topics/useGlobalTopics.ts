import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import globalTopicsKeys from './keys';
import {
  IGlobalTopics,
  GlobalTopicsKeys,
  IGlobalTopicsQueryParams,
} from './types';

const fetchGlobalTopics = ({
  forHomepageFilter,
  forOnboarding,
  includeStaticPages,

  ...queryParameters
}: IGlobalTopicsQueryParams) =>
  fetcher<IGlobalTopics>({
    path: `/global_topics`,
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

const useGlobalTopics = (
  queryParameters?: IGlobalTopicsQueryParams,
  { enabled = true } = {}
) => {
  return useQuery<IGlobalTopics, CLErrors, IGlobalTopics, GlobalTopicsKeys>({
    queryKey: globalTopicsKeys.list(queryParameters || {}),
    queryFn: () => fetchGlobalTopics(queryParameters || {}),
    enabled,
  });
};

export default useGlobalTopics;
