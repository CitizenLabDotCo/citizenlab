import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import apiClients from './keys';
import { IAPIClients, APIClientKeys } from './types';

const fetchAPIClients = () => {
  return fetcher<IAPIClients>({
    path: '/api_clients',
    action: 'get',
  });
};

const useApiClients = () => {
  return useQuery<IAPIClients, CLErrors, IAPIClients, APIClientKeys>({
    queryKey: apiClients.lists(),
    queryFn: () => fetchAPIClients(),
  });
};

export default useApiClients;
