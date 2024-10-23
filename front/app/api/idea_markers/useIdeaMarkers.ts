import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaMarkerKeys from './keys';
import { QueryParameters, IIdeaMarkers, IdeaMarkersKeys } from './types';

const fetchIdeaMarkers = ({
  projectIds,
  phaseId,
  ...queryParameters
}: QueryParameters) =>
  fetcher<IIdeaMarkers>({
    path: `/ideas/as_markers`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      projects: projectIds,
      phase: phaseId,
      'page[number]': 1,
      'page[size]': 5000,
    },
  });

const useIdeaMarkers = (
  queryParameters: QueryParameters,
  loadIdeaMarkers = true
) => {
  return useQuery<IIdeaMarkers, CLErrors, IIdeaMarkers, IdeaMarkersKeys>({
    queryKey: ideaMarkerKeys.list(queryParameters),
    queryFn: () => fetchIdeaMarkers(queryParameters),
    enabled: loadIdeaMarkers,
  });
};

export default useIdeaMarkers;
