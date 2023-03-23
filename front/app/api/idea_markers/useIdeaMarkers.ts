import { useQuery } from '@tanstack/react-query';
import { QueryParameters, IIdeaMarkers, IdeaMarkersKeys } from './types';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaMarkerKeys from './keys';

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

const useIdeaMarkers = (queryParameters: QueryParameters) => {
  return useQuery<IIdeaMarkers, CLErrors, IIdeaMarkers, IdeaMarkersKeys>({
    queryKey: ideaMarkerKeys.list(queryParameters), // TODO
    queryFn: () => fetchIdeaMarkers(queryParameters),
  });
};

export default useIdeaMarkers;
