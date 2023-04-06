import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeMarkersKeys from './keys';
import { IInitiativeMarkers, InitiativeMarkersKeys } from './types';

const fetchInitativeMarkers = () =>
  fetcher<IInitiativeMarkers>({
    path: '/initiatives/as_markers',
    action: 'get',
  });

const useInitiativeMarkers = () => {
  return useQuery<
    IInitiativeMarkers,
    CLErrors,
    IInitiativeMarkers,
    InitiativeMarkersKeys
  >({
    queryKey: initiativeMarkersKeys.lists(),
    queryFn: fetchInitativeMarkers,
  });
};

export default useInitiativeMarkers;
