import { useQuery } from '@tanstack/react-query';
import { QueryParameters, IIdeaMarkers, IdeaMarkersKeys } from './types';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaMarkerKeys from './keys';

export const defaultPageSize = 24;

const fetchIdeaMarkers = (queryParameters: QueryParameters) =>
  fetcher<IIdeaMarkers>({
    path: `/ideas/as_markers`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[number]': queryParameters['page[number]'] || 1,
      'page[size]': queryParameters['page[size]'] || defaultPageSize,
    },
  });

const useIdeaMarkers = (queryParameters: QueryParameters) => {
  return useQuery<IIdeaMarkers, CLErrors, IIdeaMarkers, IdeaMarkersKeys>({
    queryKey: ideaMarkerKeys.list(queryParameters), // TODO
    queryFn: () => fetchIdeaMarkers(queryParameters),
  });
};

export default useIdeaMarkers;
