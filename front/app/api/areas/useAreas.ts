import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IAreas, AreasKeys, IAreasQueryParams } from './types';

const fetchAreas = (filters: IAreasQueryParams) => {
  const {
    pageNumber,
    pageSize,
    forHomepageFilter: for_homepage_filter,
    includeStaticPages,
  } = filters;
  return fetcher<IAreas>({
    path: '/areas',
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 5000,
      for_homepage_filter,
      ...(includeStaticPages && {
        include: 'static_pages',
      }),
    },
  });
};

const useAreas = (queryParams: IAreasQueryParams) => {
  return useQuery<IAreas, CLErrors, IAreas, AreasKeys>({
    queryKey: eventsKeys.list(queryParams),
    queryFn: () => fetchAreas(queryParams),
  });
};

export default useAreas;
