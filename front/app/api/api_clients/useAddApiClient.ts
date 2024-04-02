import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import apiClientsKeys from './keys';
import { IAPIClientResponse } from './types';

interface IAPIClientAdd {
  name: string;
}

const addApiClient = async (requestBody: IAPIClientAdd) =>
  fetcher<IAPIClientResponse>({
    path: '/api_clients',
    action: 'post',
    body: { api_client: requestBody },
  });

const useAddApiClient = () => {
  const queryClient = useQueryClient();
  return useMutation<IAPIClientResponse, CLErrorsWrapper, IAPIClientAdd>({
    mutationFn: addApiClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClientsKeys.lists() });
    },
  });
};

export default useAddApiClient;
