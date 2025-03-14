import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import areasKeys from './keys';
import { IAreas, AreasKeys, IAreasQueryParams } from './types';

const fetchAreas = (filters: IAreasQueryParams) => {
  const {
    pageNumber,
    pageSize,
    forHomepageFilter: for_homepage_filter,
    forOnboarding: for_onboarding,
    includeStaticPages,
    ...queryParameters
  } = filters;
  return fetcher<IAreas>({
    path: '/areas',
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 5000,
      for_homepage_filter,
      for_onboarding,
      ...(includeStaticPages && {
        include: 'static_pages',
      }),
    },
  });
};

const useAreas = (queryParams: IAreasQueryParams, { enabled = true } = {}) => {
  return useQuery<IAreas, CLErrors, IAreas, AreasKeys>({
    queryKey: areasKeys.list(queryParams),
    queryFn: () => fetchAreas(queryParams),
    enabled,
  });
};

export default useAreas;
