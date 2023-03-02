import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import viewsKeys from './keys';
import { IInitiativeMarkers, InitiativeMarkersKeys } from './types';

const fetchInitativeMarkers = () =>
  fetcher<IInitiativeMarkers>({
    path: '/initiatives/as_markers',
    action: 'get',
  });

const useInitativeMarkers = () => {
  return useQuery<
    IInitiativeMarkers,
    CLErrors,
    IInitiativeMarkers,
    InitiativeMarkersKeys
  >({
    queryKey: viewsKeys.lists(),
    queryFn: fetchInitativeMarkers,
  });
};

export default useInitativeMarkers;
